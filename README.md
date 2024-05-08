# API for for total football built with nodejs and the following dependencies
* express
* dotenv
* multer
* express-async-errors
* mongoose
* cookie-parser
* bcrypt
* jsonwebtoken
* nodemailer
* nodemon for running my program
## API listens on port 5001
### Folder structures
* contollers - stores all the endpoints
* db - database connection (MongoDB)
* errors - error handlers
* middleware - stores all the middleware
* model - stores all the database schemas
* routers - stores all the routing
* upload - stores all the files
### starting the application
* my application uses "start": "nodemon app.js"
* make sure nodemon is installed locally then
* npm start
### routings
* server listening on localhost:5001
> Admin related routes
* create admin - localhost:5001/api/v1/admin/registeradm
* login admin - localhost:5001/api/v1/admin/loginadmin
* persis admin login - localhost:5001/api/v1/admin/persistlogin
* logout admin - localhost:5001/api/v1/admin/logoutadmin
> football related routes
* create football - localhost:5001/api/v1/football/create
* get all created football - localhost:5001/api/v1/football/allfootball
* get created football by id - localhost:5001/api/v1/football/allfootball/:footballID"
* delete football - localhost:5001/api/v1/football/allfootball/:footballID
* update football - localhost:5001/api/v1/football/allfootball/:footballID
