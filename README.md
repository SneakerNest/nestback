# Sneaker Nest Backend

This project is the backend for the Sneaker Nest application. It uses Node.js, Express, and MySQL. The backend is containerized using Docker and Docker Compose.

## Prerequisites

- Docker
- Docker Compose
- Node.js
- npm

## Getting Started
Follow the instructions below to set up and run the backend server on your local machine and docker compose.

## Setting Up the Backend Server

### Clone the repository
```bash
git clone https://github.com/SneakerNest/nestback.git
```
### Install Dependencies
Run the following command to install all the necessary packages:
```bash
npm install
```
### Environment Variables

Create a `.env` file in the root directory of the project with the following content:

```bash
# MySQL Configuration (Docker)
DB_HOST=db
MYSQLDB_USER=root
MYSQLDB_ROOT_PASSWORD=yourpassword
MYSQLDB_DATABASE=sneaker_nest
MYSQLDB_DOCKER_PORT=3306
MYSQLDB_LOCAL_PORT=3306
NODE_LOCAL_PORT=5001

# Node.js Configuration (Docker)
NODE_DOCKER_PORT=3000

# JWT Secret
JWT_SECRET=sQ4kdL9vY7wkmZspj7wp8YQXxjpfv3yU
```

### Docker Container 

Run the following commands to build and start the Docker containers:
```bash
docker-compose build
docker-compose up
```
This will build the Docker images and start the containers. The backend server will be running on port 3000 (mapped to 5001 on your local machine), and the MySQL database will be running on port 3306.

## Database Setup
follow these steps (first time or new table has been added):

### Initial Setup

Run the following command to access the MySQL container:
```bash
cd <db folder>
```

### Setup Tables and populate it with data 

run the following SQL command:
```sql
docker exec -it [name_of_db_container] mysql -u root -p < setup.sql
docker exec -it [name_of_db_container] mysql -u root -p < sampleData.sql
docker exec -it [name_of_db_container] mysql -u root -p < reset.sql
```

Replace [name_of_db_container] with the name of your MySQL container. You will be prompted to enter the MySQL root password.

Ensure that the table is created in the sneaker_nest database.

To make sure of the tables and everything: 

```sql
docker exec -it [name_of_db_container] mysql -u root -p
USE sneaker_nest;
SHOW TABLES;
```
To check the data (example):

```sql
SELECT * FROM USERS;
```

## Testing 

### Check if the server is running

Open your browser and navigate to http://localhost:5001/. You should see a response indicating that the server is running.

### Use Postman to test the API endpoints

Use Postman to send requests to the API endpoints and verify that everything is working correctly.

## Summary

By following these steps, you will set up the backend for the Sneaker Nest application, including the database and server. You can then use Postman to test the API endpoints and ensure that everything is working as expected.

## Additional Notes

Ensure that Docker and Docker Compose are installed and running on your machine.
The .env file should be created in the root directory of the project.
The MySQL container name should be replaced with the actual name of your MySQL container when running the docker exec command.
The initial database setup steps are only required for the first time setup or whenever a new table is created.