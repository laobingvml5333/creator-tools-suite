#!/usr/bin/env python3
"""
Serverless Twitter Bot for Creator Tools Suite
Automatically tweets promotional content via GitHub Actions
"""

import os
import json
import random
import tweepy
from datetime import datetime

# Load tweets database
def load_tweets():
    with open('.github/scripts/tweets_db.json', 'r', encoding='utf-8') as f:
        return json.load(f)

# Authenticate with Twitter API v2
def authenticate():
    api_key = os.environ.get('TWITTER_API_KEY')
    api_secret = os.environ.get('TWITTER_API_SECRET')
    access_token = os.environ.get('TWITTER_ACCESS_TOKEN')
    access_secret = os.environ.get('TWITTER_ACCESS_SECRET')
    
    if not all([api_key, api_secret, access_token, access_secret]):
        raise ValueError("Missing Twitter API credentials in environment variables")
    
    # Authenticate using OAuth 1.0a
    auth = tweepy.OAuth1UserHandler(
        api_key, api_secret,
        access_token, access_secret
    )
    
    # Create API v2 client
    client = tweepy.Client(
        consumer_key=api_key,
        consumer_secret=api_secret,
        access_token=access_token,
        access_token_secret=access_secret
    )
    
    return client

# Post tweet
def post_tweet(client, tweet_text):
    try:
        response = client.create_tweet(text=tweet_text)
        return response.data['id']
    except Exception as e:
        print(f"Error posting tweet: {e}")
        raise

# Main function
def main():
    print("🤖 Starting Twitter Bot...")
    print(f"⏰ Current time: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')} UTC")
    
    # Load tweets
    tweets_data = load_tweets()
    tweets = tweets_data['tweets']
    
    # Select random tweet
    selected_tweet = random.choice(tweets)
    
    print(f"📝 Selected tweet: {selected_tweet['tool']}")
    print(f"💬 Content: {selected_tweet['content'][:50]}...")
    
    # Authenticate
    print("🔐 Authenticating with Twitter...")
    client = authenticate()
    
    # Post tweet
    print("📤 Posting tweet...")
    tweet_id = post_tweet(client, selected_tweet['content'])
    
    print(f"✅ Tweet posted successfully!")
    print(f"🔗 Tweet ID: {tweet_id}")
    print(f"🌐 View at: https://twitter.com/user/status/{tweet_id}")

if __name__ == "__main__":
    main()
