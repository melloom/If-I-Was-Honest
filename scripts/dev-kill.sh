#!/bin/bash
# Kill any running Next.js dev server (next dev) before starting a new one

PIDS=$(ps aux | grep 'next dev' | grep -v grep | awk '{print $2}')
if [ ! -z "$PIDS" ]; then
  echo "Killing Next.js dev server(s) with PID(s): $PIDS"
  kill -9 $PIDS
fi

# Now start the dev server
npm run dev
