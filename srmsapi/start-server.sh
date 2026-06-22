'#!/bin/bash
echo "Building and starting srmsapi server..."
docker stop srmsapi-server 2>/dev/null; docker rm srmsapi-server 2>/dev/null
docker build -t srmsapi-server .
docker run --name srmsapi-server -p 5000:5000 -d srmsapi-server
echo "srmsapi server started on port 5000"
'
