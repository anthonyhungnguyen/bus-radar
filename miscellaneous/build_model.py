import pandas as pd
from linearmodels.system import SUR
import statsmodels.api as sm

# Load data
data = pd.read_csv("./historical_data.csv")

# Convert time columns to seconds for regression purposes
data["arrival_time_sec"] = pd.to_timedelta(data["arrival_time"]).dt.total_seconds()
data["bus_arrival_time_sec"] = pd.to_timedelta(
    data["bus_arrival_time"]
).dt.total_seconds()

# Calculate delay
data["delay"] = data["bus_arrival_time_sec"] - data["arrival_time_sec"]

# Define explanatory variables
explanatory_vars = [
    "temperature",
    "rain_intensity",
    "snow_intensity",
    "wind_speed",
    "distance_to_stop",
]

# Set up the SUR Model for all stops
unique_stops = data["stop_id"].unique()

equations = {}

for stop_id in unique_stops:
    stop_data = data[data["stop_id"] == stop_id].head(
        100
    )  # Limit to top 100 observations for each stop
    if len(stop_data) < 100:
        continue  # Skip if not enough observations
    y = stop_data["delay"]
    X = stop_data[explanatory_vars]
    X = sm.add_constant(X)  # Add a constant term for the intercept
    equations[f"eq_{stop_id}"] = {"dependent": y, "exog": X}

# Fit the SUR model
sur_model = SUR(equations)
sur_results = sur_model.fit()
print(sur_results)
