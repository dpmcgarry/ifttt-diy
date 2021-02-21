import calendar
import json
import logging
import os
import sys

import boto3
import feedparser

logger = logging.getLogger()
log_level = os.environ.get("LOGGING_LEVEL", "DEBUG").upper()
logger.setLevel(log_level)

def handler(event, context):
    logging.info("Lambda handler entrypoint")
    logging.info("Logging level: " + log_level)    
    
    logging.debug("Event: " + json.dumps(event))
    logging.debug("Ctx: " + json.dumps(context))
    ddb = boto3.client("dynamodb")
    resp = ddb.scan(TableName="ifttt-diy-rssfeeds")
    logging.debug('DDB RESP')
    logging.debug(json.dumps(resp))

    if 'LastEvaluatedKey' in resp:
        logging.critical("More than 1MB of data returned from DDB scan")
        sys.exit(0)
    for item in resp["Items"]:
        logging.debug("DDB Item")
        logging.debug(json.dumps(item))
        url = item["feedurl"]["S"]
        logging.info("Working on: " + url)
        feed = feedparser.parse(url)
        # feed keys: ['bozo', 'entries', 'feed', 'headers', 'updated', 'updated_parsed', 'href', 'status', 'encoding', 'version', 'namespaces']
        # entry keys: ['id', 'guidislink', 'link', 'content', 'summary', 'authors', 'author_detail', 'href', 'author', 'media_content', 'media_credit', 'credit', 'title', 'title_detail', 'published', 'published_parsed', 'updated', 'updated_parsed', 'links']
        feed_updated = calendar.timegm(feed["updated_parsed"])
        entry_id = feed.entries[0]["id"]
        entry_link = feed.entries[0]["link"]
        entry_published = calendar.timegm(feed.entries[0]["published_parsed"])
        entry_updated = calendar.timegm(feed.entries[0]["updated_parsed"])
        
        


    return {
        "statusCode": 200,
    }

if __name__ == "__main__":
    # entrypoint for local testing
    handler(None, None)