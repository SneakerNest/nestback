# Docker Compose Nodejs and MySQL example

## Open Docker Desktop first then do the below in your terminal!

## after opening docker desktop (write (npm i) in your terminal) to install dependencies

## Run the System
We can easily run the whole with only a single command:
```bash
docker compose up
```

Docker will pull the MySQL and Node.js images (if our machine does not have it before).

The services can be run on the background with command:
```bash
docker compose up -d
```

## Stop the System
Stopping all the running containers is also simple with a single command:
```bash
docker compose down
```

If you need to stop and remove all containers, networks, volumes, and all images used by any service in <em>docker-compose.yml</em> file, use the command:
```bash
docker compose down --rmi all -v
```

To check if all worked, open your browser and search: 
```bash
http://localhost:6868/
```