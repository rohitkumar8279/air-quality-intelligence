# AirIntel - Intelligent Air Quality Monitoring

AirIntel is a comprehensive, AI-powered air quality monitoring and prediction platform. It leverages live data from Open-Meteo, predicts future air quality using an XGBoost Machine Learning model, and provides intelligent health recommendations through an advanced React frontend and FastAPI backend.

## 🚀 Features

- **Real-Time Air Quality Map**: Interactive Leaflet maps tracking pollution across the city.
- **AI-Powered Predictions**: XGBoost ML model predicting future AQI based on historical patterns and weather data.
- **Intelligent Analytics**: Actionable health advice, pollution analysis, and weather impact reports.
- **Historical Data**: Search and filter past air quality records.
- **Premium UI**: Modern, glassmorphism design with seamless Light and Dark mode support.
- **Responsive**: Fully responsive and optimized for mobile, tablet, and desktop.

## 🏗️ Architecture

- **Frontend**: React.js, Vite, Framer Motion, Recharts, Leaflet, Lucide React.
- **Backend**: Python, FastAPI, SQLAlchemy, Uvicorn, Pandas.
- **Database**: PostgreSQL (Neon Serverless).
- **Machine Learning**: XGBoost (Regressor), Scikit-Learn.
- **Hosting**: Vercel (Frontend), Render (Backend).

## 📸 Screenshots
*(Add screenshots of the Dashboard, Map View, and AI Insights here)*

## 🛠️ Installation (Local Development)

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/air-quality-intelligence.git
cd air-quality-intelligence
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
pip install -r requirements.txt
```
Create a `.env` file in the `backend` directory:
```
DATABASE_URL=postgresql://user:password@localhost/dbname
OPEN_METEO_API_URL=https://api.open-meteo.com/v1
SECRET_KEY=your-secret-key
```
Run the FastAPI server:
```bash
uvicorn main:app --reload --port 8000
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```
Create a `.env` file in the `frontend` directory:
```
VITE_API_URL=http://localhost:8000/api
```
Run the Vite development server:
```bash
npm run dev
```

## 🌍 Deployment

### Deploying the Database (Neon)
1. Create a free PostgreSQL database on [Neon.tech](https://neon.tech).
2. Copy the connection string.

### Deploying the Backend (Render)
1. Push your code to GitHub.
2. Go to [Render](https://render.com) and create a new **Web Service**.
3. Connect your GitHub repository.
4. Render will automatically detect the `render.yaml` file and configure the build/start commands.
5. In the Render Dashboard, add the following Environment Variables:
   - `DATABASE_URL` (Your Neon connection string)
   - `CORS_ORIGINS` (Your Vercel frontend URL, e.g., `https://my-frontend.vercel.app`)
   - `SECRET_KEY` (A random secure string)

### Deploying the Frontend (Vercel)
1. Go to [Vercel](https://vercel.com) and create a new project.
2. Connect your GitHub repository.
3. Set the Framework Preset to **Vite**.
4. In Environment Variables, add:
   - `VITE_API_URL` (Your Render backend URL, e.g., `https://my-backend.onrender.com/api`)
5. Click **Deploy**.

## 📂 Folder Structure

```
air-quality-intelligence/
├── backend/
│   ├── main.py             # FastAPI entry point
│   ├── database.py         # SQLAlchemy configuration
│   ├── models.py           # Database models
│   ├── crud.py             # Database queries
│   ├── ml/                 # Trained XGBoost model (model.json)
│   └── services/           # External APIs and AI services
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable React components
│   │   ├── pages/          # Application routes
│   │   ├── services/       # Axios API integrations
│   │   └── context/        # React Context (City Context, Auth)
│   ├── index.html          # HTML entry point (SEO configured)
│   └── vite.config.js      # Vite build optimization
└── render.yaml             # Render deployment configuration
```

## 🔌 API Documentation

Once the backend is running, visit the interactive Swagger UI documentation at:
- Local: `http://localhost:8000/docs`
- Production: `https://your-render-backend.onrender.com/docs`

## 🧠 Machine Learning Pipeline

1. **Data Collection**: Live data fetched via Open-Meteo API.
2. **Feature Engineering**: Temperature, Humidity, PM2.5, PM10, NO2, and Temporal features (Hour, Day, Month).
3. **Model**: `XGBRegressor` trained on historical data.
4. **Serving**: The model is saved as `ml/model.json` and loaded into memory on FastAPI startup. Predictions are served in real-time via the `/api/predict` endpoint.

## 🔭 Future Scope

- Support for multiple cities across the globe.
- Real-time IoT sensor integration.
- Mobile Application (React Native).
- User alerts via Email and SMS.

---
*Built with ❤️ for a cleaner environment.*
