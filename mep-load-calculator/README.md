# MEP Load Calculator

## Overview
The MEP Load Calculator is a web application designed to assist users in performing Mechanical, Electrical, and Plumbing (MEP) load calculations. Users can input various parameters, and the application will process these inputs, perform necessary calculations, and generate an Excel file containing the results.

## Project Structure
The project is organized as follows:

```
mep-load-calculator
├── static
│   ├── css
│   │   └── main.css          # Styles for the application
│   ├── js
│   │   └── main.js           # JavaScript for user interactions
│   └── favicon.ico           # Favicon for the web application
├── templates
│   ├── index.html            # Main input form for users
│   ├── layout.html           # Base layout for the application
│   └── results.html          # Displays calculation results and download link
├── app.py                    # Main Flask application
├── utils
│   ├── __init__.py           # Marks utils as a package
│   ├── excel_handler.py      # Functions for handling Excel files
│   └── calculations.py       # Functions for performing calculations
├── requirements.txt          # Project dependencies
├── .gitignore                # Files to ignore in Git
└── README.md                 # Project documentation
```

## Installation
1. Clone the repository:
   ```
   git clone <repository-url>
   cd mep-load-calculator
   ```

2. Create a virtual environment:
   ```
   python -m venv venv
   ```

3. Activate the virtual environment:
   - On Windows:
     ```
     venv\Scripts\activate
     ```
   - On macOS/Linux:
     ```
     source venv/bin/activate
     ```

4. Install the required packages:
   ```
   pip install -r requirements.txt
   ```

## Usage
1. Run the Flask application:
   ```
   python app.py
   ```

2. Open your web browser and navigate to `http://127.0.0.1:5000`.

3. Fill out the input form with the necessary parameters for the MEP load calculation.

4. Submit the form to perform the calculations. The results will be displayed on a new page, along with a link to download the generated Excel file.

## Contributing
Contributions are welcome! Please feel free to submit a pull request or open an issue for any suggestions or improvements.

## License
This project is licensed under the MIT License. See the LICENSE file for details.