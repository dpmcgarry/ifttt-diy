import calendar
import logging
import os
import sys

import boto3
import feedparser
import jsonpickle
import simplejson as json

logger = logging.getLogger()
log_level = os.environ.get("LOGGING_LEVEL", "DEBUG").upper()
logger.setLevel(log_level)

def update_item(table, url, info):
    resp = table.put_item(
        Item={
            "feedurl": url,
            "feed_updated": info["feed_updated"],
            "entry_id": info["entry_id"],
            "entry_link": info["entry_link"],
            "entry_published": info["entry_published"],
            "entry_updated": info["entry_updated"],
        }
    )
    logging.debug(json.dumps(resp))

def handler(event, context):
    logging.info("Lambda handler entrypoint")
    logging.info("Logging level: " + log_level)    
    logging.debug("Env Vars: " + jsonpickle.encode(dict(**os.environ)))
    logging.debug("Event: " + jsonpickle.encode(event))
    logging.debug("Ctx: " + jsonpickle.encode(context))
    table_name = os.environ.get("TABLE_NAME")
    if not table_name:
        table_name = "ifttt-diy-rssfeeds"
        logging.warning("Table Name env var not found; using default")
    logging.info("Using DDB Table Name: " + table_name)
    ddb = boto3.resource("dynamodb")
    table = ddb.Table(table_name)

    resp = table.scan(TableName=table_name)
    logging.debug('DDB RESP')
    logging.debug(json.dumps(resp))

    if 'LastEvaluatedKey' in resp:
        logging.critical("More than 1MB of data returned from DDB scan")
        sys.exit(0)
    for item in resp["Items"]:
        logging.debug("DDB Item")
        logging.debug(json.dumps(item))
        url = item["feedurl"]
        logging.info("Working on: " + url)
        feed = feedparser.parse(url)
        # feed keys: ['bozo', 'entries', 'feed', 'headers', 'updated', 'updated_parsed', 'href', 'status', 'encoding', 'version', 'namespaces']
        # entry keys: ['id', 'guidislink', 'link', 'content', 'summary', 'authors', 'author_detail', 'href', 'author', 'media_content', 'media_credit', 'credit', 'title', 'title_detail', 'published', 'published_parsed', 'updated', 'updated_parsed', 'links']
        info = {}
        info["feed_updated"] = calendar.timegm(feed["updated_parsed"])
        info["entry_id"] = feed.entries[0]["id"]
        info["entry_link"] = feed.entries[0]["link"]
        info["entry_published"] = calendar.timegm(feed.entries[0]["published_parsed"])
        info["entry_updated"] = calendar.timegm(feed.entries[0]["updated_parsed"])
        logging.debug(json.dumps(info))
        if "feed_updated" in item:
            if item["feed_updated"] > info["feed_updated"]:
                logging.info("Feed has been updated!")
            else:
                logging.info("No new updates, nothing to do here...")
        else:
            logging.info("First time exec!")
            update_item(table, url, info)
        
        


    return {
        "statusCode": 200,
    }

if __name__ == "__main__":
    # entrypoint for local testing
    handler(None, None)