# AI-Powered Urban Air Quality Intelligence Platform

A production-ready platform that fuses environmental data, predictive machine learning, and AI to provide actionable air quality intelligence for smart city interventions.

## Overview
This platform acts as an intelligence layer to help city administrators move from reactive monitoring to proactive, evidence-based intervention. It features live data ingestion, XGBoost forecasting, an interactive React dashboard, and a Gemini AI-powered assistant.

## Features
- **Live AQI Monitoring**: Near real-time data from OpenAQ.
- **Predictive Forecasting**: 24-72 hour forecasts utilizing historical data and meteorological APIs.
- **Interactive Dashboards**: Geospatial heatmaps and rule-based health risk advisories.
- **AI Intervention Assistant**: Context-aware recommendations using Google Gemini.

## Folder Structure
- `/backend`: FastAPI service, database models, and API endpoints.
- `/frontend`: React (Vite) application for the user dashboard.
- `/ml`: Machine learning pipelines for data collection and model training.
- `/database`: Database connection and schema initialization scripts.
