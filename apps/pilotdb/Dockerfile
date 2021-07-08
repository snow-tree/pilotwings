FROM node:16.4.0-alpine

COPY ./dist/apps/pilotdb ./dist/apps/pilotdb

# Expose the port the app runs in
EXPOSE 4200

# Serve the app
CMD ["node", "dist/apps/pilotdb/server/main.js"]