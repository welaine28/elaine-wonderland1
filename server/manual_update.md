check pg
```
heroku pg:psql --app elaine-wonderland-server
```

If this opens a psql prompt → you’re good.

Then inside psql:
```
\i benchmark.sql
```
