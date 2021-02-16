import json

def handler(event, context):
    # TODO implement
    print(type(event))
    print(event)
    print(type(context))
    print(context)
    return {
        'statusCode': 200,
        'body': json.dumps('Hello from Lambda!')
    }
