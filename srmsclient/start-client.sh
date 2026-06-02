'#!/bin/bash
echo "Building and starting srmsclient client..."
docker stop srmsclient-client 2>/dev/null; docker rm srmsclient-client 2>/dev/null
docker build -t srmsclient-client .
docker run --name srmsclient-client -p 80:80 -d srmsclient-client
echo "srmsclient client started on port 80"
'
