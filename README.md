# elaine-wonderland1

## Create a new app within monorepo
make multiple apps within a monorepo but deployed to separate heroku apps


### Setup for backend (python in server/)

```
# Create the backend Heroku app
heroku create elaine-wonderland-server

# Clear existing buildpacks
heroku buildpacks:clear -a elaine-wonderland-server

# Add the monorepo buildpack first
heroku buildpacks:add -a elaine-wonderland-server https://github.com/lstoll/heroku-buildpack-monorepo

# Add the actual buildpack for backend (Python)
heroku buildpacks:add -a elaine-wonderland-server  heroku/python

# Tell Heroku to use the server folder
heroku config:set APP_BASE=server -a elaine-wonderland-server
```


### Setup for Frontend (React in client/)

```
# Create the frontend Heroku app
heroku create elaine-wonderland-client

# Clear existing buildpacks (important!)
heroku buildpacks:clear -a elaine-wonderland-client

# Add the monorepo buildpack first
heroku buildpacks:add -a elaine-wonderland-client https://github.com/lstoll/heroku-buildpack-monorep

# Add the actual buildpack for frontend (Node.js)
heroku buildpacks:add -a elaine-wonderland-client heroku/nodejs

# Tell Heroku to use the client folder
heroku config:set APP_BASE=client -a elaine-wonderland-client

heroku config:set NODE_ENV=production -a elaine-wonderland-client
```


start the server locally
```
# backend and frontend
python app.py
npm run dev
```
access the db
```
heroku pg:psql --app elaine-wonderland-server
```
