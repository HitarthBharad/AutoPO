# Purchase Order Processing Application

This is a full-stack web application that enables users to upload purchase order (PO) PDF files, automatically process and extract line-item data, match them with product names, and manage the resulting purchase orders through a dashboard interface.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running the Application](#running-the-application)
- [Application Routes](#application-routes)
  - [Dashboard](#-dashboard)
  - [PO Processing](#-process-po-processing)
- [Usage Guide](#usage-guide)
  - [Processing a Purchase Order](#processing-a-purchase-order)
  - [Viewing and Managing Orders](#viewing-and-managing-orders)

## Features

- Upload and parse PO PDF files
- Auto-extract line-item data including item name, quantity, unit price, and total amount
- Automatically match items to product names
- Allow users to edit processed data before submission
- Export processed data to CSV
- Dashboard to view and manage all processed orders
- View detailed breakdown of each order

## Tech Stack

- **Frontend**: Next.js (App Router), Tailwind CSS, ShadCN UI
- **Backend**: Next.js API Routes
- **Database**: MongoDB
- **PDF Parsing & Matching**: Custom logic integrated in API route (details omitted here)

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- MongoDB (local or Atlas)

### Installation

Clone the repository:

```
git clone https://github.com/yourusername/AutoPO.git
cd AutoPO
```

Install dependencies:
```
npm install
```

### Environment Variables

Create a .env file in the root of the project with the following variables:
```
MONGODB_URI=your_mongodb_connection_uri
MONGODB_DB=your_database_name
```

Replace your_mongodb_connection_uri and your_database_name with your actual credentials.

### Running the Application

Start the development server:
```
npm run dev
```

## Application Routes

### Dashboard
	•	Displays a list of all previously processed purchase orders.
	•	Users can:
	•	View summary of each order
	•	Open detailed dialog showing line items and matched products
	•	View match status for each line item

### PO Processing
	•	Upload interface for PDF-based purchase orders.
	•	On upload:
	•	File is parsed and line items are extracted
	•	Matching products are fetched based on item names
	•	Users can:
	•	Edit the parsed data before submission
	•	Submit the finalized data to create a new purchase order
	•	Download the processed data in CSV format

## Usage Guide

### Viewing and Managing Orders
	1.	Navigate to /
	2.	The dashboard will show all processed orders
	3.	Click View on any row to open a detailed dialog
	4.	Dialog shows:
	•	Order metadata (e.g., order number, date)
	•	Table of line items, their quantities, pricing, and matched products
	•	Match status icon indicating success or failure

### Processing a Purchase Order
	1.	Navigate to /process
	2.	Upload a PO PDF file using the file upload component
	3.	The app will:
	•	Parse the file
	•	Display a table of extracted line items
	•	Attempt to match each item to an existing product
	4.	Edit any fields if required
	5.	Click Submit to save the processed order
	6.	Optionally, click Download CSV to export the data

