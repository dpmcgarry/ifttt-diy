import json
import logging
import os

import boto3

logger = logging.getLogger()
log_level = os.environ.get("LOGGING_LEVEL", "INFO").upper()
logger.setLevel(log_level)

def main():
    table_name = os.environ.get("TABLE_NAME")
    if not table_name:
        table_name = "ifttt-diy-rssfeeds"
        logging.warning("Table Name env var not found; using default")
    logging.info("Using DDB Table Name: " + table_name)
    ddb = boto3.resource("dynamodb")
    table = ddb.Table(table_name)

    with open("urls.txt", 'r') as urlfile:
        urls = urlfile.readlines()
    for url in urls:
        resp = table.put_item(
            Item={
                "feedurl": url.rstrip()
            }
        )
        logging.info(json.dumps(resp))


if __name__ == "__main__":
    main()