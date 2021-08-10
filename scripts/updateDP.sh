#!/bin/bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
cd $SCRIPT_DIR/.. && git pull 2>&1
npm install 2>&1
pm2 restart pm2-process.json 2>&1
