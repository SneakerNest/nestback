# SneakerNest Project

## Requirement

1. **Create a `.env` file:**

    Create a `.env` file based on the `.env.example` file (or your provided example) with the following content:
    ```env
    DB_HOST=localhost
    DB_USER=root
    DB_PASSWORD=yourpassword
    DB_NAME=sneaker_nest
    DB_PORT=3306
    ```

2. **Build and Run Docker Containers:**

    Build and start the containers:
    ```bash
    docker-compose build
    docker-compose up -d
    ```

3. **Set up the Database:**

    If the database is not yet set up, run the following to import the schema (if you have a `.sql` dump):
    ```bash
    docker exec -i nestback-db-1 mysql -u root -p yourpassword sneaker_nest < mydbscheme_dump.sql
    ```

4. **Access the Application:**

    Visit `http://localhost:3000` in your browser to access the application.

## Troubleshooting

- If the application isn't running, check the logs for the backend container:
    ```bash
    docker logs nestback-back-1
    ```

- If you can't connect to the MySQL database, check the MySQL container logs:
    ```bash
    docker logs nestback-db-1
    ```

- If there's an issue with the database connection, ensure the database credentials are correct in the `.env` file.

## Additional Notes

- The backend service runs on port `3000`, and the MySQL service is exposed on port `3307` (or whatever you set it to in `docker-compose.yml`).

Feel free to adjust any placeholders (like `yourpassword` or `your-repo-url`) to make the instructions specific to your project.

