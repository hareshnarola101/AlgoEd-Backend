# AlgoEd-Backend

# Cycle Around the World

Cycle Around the World is a mini-project that estimates cycling times to various tourist destinations around the world, taking into consideration their accessibility for cycling.

## Table of Contents

- [Project Overview](#project-overview)
- [Key Features](#key-features)
- [Database Setup](#database-setup)
- [Express Application Setup](#express-application-setup)
- [Data and Example Spots](#data-and-example-spots)
- [Calculations](#calculations)
- [Error Handling](#error-handling)
- [Frontend](#frontend)
- [Usage](#usage)

## Project Overview

In the "Cycle Around the World" mini-project, we showcase skills in creating a database, developing a Node.js Express application, performing data calculations, and ensuring robust error handling. The objective is to create an application that estimates cycling times to various tourist destinations around the world, while also considering their accessibility for cycling.

## Key Features

### Database Setup

- Create a MySQL database named "TouristSpotsDB."
- Design a table to store information about tourist spots.
  - Fields: `id` (auto-incrementing primary key), `name` (VARCHAR), `latitude` (DECIMAL), `longitude` (DECIMAL), `accessible_by_cycling` (BOOLEAN).

### Express Application Setup

- Develop a Node.js Express application with JWT (JSON Web Token) authentication for secure access.
- Define the following routes:
  - `POST /auth`: Authenticate users using JWT by providing a username and password.
  - `GET /spots`: Return a list of tourist spots with their names (without latitude and longitude). This endpoint requires JWT authentication.
  - `GET /spots/:spotName`: Provide detailed information about a specific tourist spot, including latitude, longitude, and accessibility by cycling. This endpoint requires JWT authentication.
  - `POST /calculate`: Accept user input for cycling time estimation. JWT authentication is required for this endpoint.
  - `GET /estimate`: Return the estimated time it would take to cycle from the user's location to the chosen tourist spot. This endpoint also requires JWT authentication.

### Data and Example Spots

- Populate the MySQL database with data for 10 example tourist spots, each with a name, latitude, longitude, and cycling accessibility.

### Calculations

- When a user makes a POST request to `/calculate`, verify if the chosen tourist spot is accessible by cycling.
- If accessible, calculate the distance (in kilometers) between the user's location and the chosen spot using the Haversine formula.
- Estimate the time (in hours) it would take to cycle from the user's location to the chosen spot based on their input of cycling speed and daily cycling hours.
- If the spot is not accessible for cycling, return a message indicating this limitation.

### Error Handling

- Handle errors gracefully, including cases where the chosen tourist spot does not exist, invalid user input, or issues related to database connectivity.

### Frontend

- Create a user interface for the application. You can use Angular for the frontend, providing a rich and interactive experience.

## Usage

To run the application:

1. Clone the repository.
2. Set up the MySQL database and create the necessary tables (as defined in the project).
3. Navigate to the project directory and run the Express application using `node app.js`.
4. Build and run the Angular frontend.

Please ensure that you have the required dependencies and configurations in place for a smooth project setup.


