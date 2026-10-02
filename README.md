# 🚚 Smart Delivery Route Planner

## 📌 Project Overview

Smart Delivery Route Planner is a DAA-based delivery route optimization system designed to find efficient routes for delivery vehicles visiting multiple locations.

The system uses graph algorithms and optimization techniques to calculate shortest paths, optimize delivery order, handle traffic conditions, and recalculate routes when roads are blocked.

The project combines **Design and Analysis of Algorithms (DAA)** with a realistic delivery-management interface.

---

## 🎯 Problem Statement

Delivery vehicles often need to visit multiple customers from a central warehouse.

If the delivery locations are visited in an inefficient order, it can result in:

- Increased travel distance
- Increased delivery time
- Higher fuel consumption
- Traffic-related delays
- Inefficient route planning

Our system solves this problem by using DAA algorithms to calculate and optimize delivery routes.

---

## 💡 Proposed Solution

The Smart Delivery Route Planner:

1. Takes a warehouse as the starting point.
2. Accepts multiple delivery locations.
3. Represents roads as a weighted graph.
4. Calculates shortest paths.
5. Finds an optimized order for visiting delivery locations.
6. Considers traffic conditions.
7. Handles blocked roads.
8. Recalculates the route when conditions change.
9. Displays the optimized route visually.
10. Provides distance, time and fuel-saving statistics.

---

## 🧠 Algorithms Used

### 1. Dijkstra's Algorithm

Dijkstra's algorithm is used to find the shortest path between locations in the road network.

**Purpose:**
- Find the minimum-distance path.
- Handle weighted roads.
- Recalculate routes when road conditions change.

**Time Complexity:**

Using a priority queue:

`O((V + E) log V)`

Where:

- V = Number of vertices
- E = Number of edges

---

### 2. Travelling Salesman Problem (TSP)

TSP is used to determine an efficient order for visiting multiple delivery locations.

The objective is to visit all required locations while minimizing total travel distance.

---

### 3. Dynamic Programming / Bitmask DP

Dynamic Programming is used to solve the TSP problem for a small number of delivery locations.

**Time Complexity:**

`O(n² × 2ⁿ)`

**Space Complexity:**

`O(n × 2ⁿ)`

---

### 4. Nearest Neighbor

A greedy approach is also implemented for comparison.

At each step, the algorithm chooses the nearest unvisited delivery location.

This provides a fast approximate solution that can be compared with the optimized approach.

---

## 🏗️ System Architecture

```text
                 User
                   │
                   ▼
        Delivery Locations
                   │
                   ▼
             Road Network
                   │
                   ▼
        ┌──────────────────┐
        │ Dijkstra         │
        │ Shortest Path    │
        └──────────────────┘
                   │
                   ▼
        ┌──────────────────┐
        │ TSP + Dynamic    │
        │ Programming      │
        └──────────────────┘
                   │
                   ▼
           Optimized Route
                   │
                   ▼
       Distance / Time / Fuel
                   │
                   ▼
          Visual Route Demo
