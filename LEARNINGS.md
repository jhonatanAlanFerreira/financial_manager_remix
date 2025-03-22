# Learnings

This document outlines the key lessons and challenges I encountered throughout this project, covering everything from transitioning to React/Remix, managing state, refactoring forms, exploring GraphQL, and documenting APIs.

---

## 1. Background

### From Angular to React

I originally came from an Angular background, where much of the state management boilerplate is built-in (or handled with Angular services). When I moved to React/Remix, I had to rethink how state is managed across components, which led me to explore several state management techniques and libraries.

---

## 2. State Management

### 2.1 Initial Challenges with `useState` and `useEffect`

- **Why It Was Problematic**  
  I initially tried using `useState` to handle all state updates. However, I ran into an issue where values weren’t being updated in time for the same render cycle. To compensate, I introduced multiple `useEffect` hooks to trigger side effects after state changes.
- **Resulting Complexity**  
  This approach quickly became cumbersome. Many components had scattered `useEffect` calls, leading to confusion about data flow and making the code harder to maintain.

### 2.2 Exploring Alternatives

- **Why Not Redux?**  
  I briefly considered Redux but noticed a lot of mixed opinions. Redux felt too heavyweight for my needs at the time, especially for a project that didn’t require massive global state handling.
- **Finding Zustand**  
  After some research, I discovered [Zustand](https://github.com/pmndrs/zustand). It’s straightforward to learn, minimally opinionated, and efficient. I was able to refactor several pages to use it, which simplified my overall architecture.

### 2.3 Adopting Zustand

- **Implementation**  
  By moving state logic into a single store, I drastically reduced the number of `useState` and `useEffect` calls in my components. Components now subscribe to only the slices of state they need.
- **Refactoring**  
  Many files required updates to consume the Zustand store. While this was time-consuming, it paid off in cleaner code and more predictable state updates.

---

## 3. Form Handling

### 3.1 Transition from Formik

- **The Rendering Issue**  
  Even after fixing state issues with Zustand, I still encountered rendering problems with Formik—certain fields wouldn’t update as expected, or updates would lag.
- **Complexity**  
  Managing complex forms and validations in Formik, combined with my existing state management setup, felt increasingly unwieldy.

### 3.2 Embracing React Hook Form

- **Why React Hook Form?**  
  I switched to [React Hook Form](https://react-hook-form.com) because it’s designed for minimal re-renders, has a more intuitive API, and integrates well with TypeScript.
- **Refactoring Effort**  
  To make the switch, I had to:
  - Update all my form components and inputs to use `register` and `Controller` (if needed).
  - Rewrite validation logic to work with React Hook Form’s schema validation or inline validations.
- **Outcome**  
  Once the refactor was complete, forms became more performant and easier to reason about. Removing many of the `useEffect` calls and inline setState logic simplified my codebase.

---

## 4. GraphQL and DataLoader

### 4.1 Initial Setup

- **Motivation**  
  I wanted to learn GraphQL and experiment with it for certain project features—particularly charts and testing relationships between models.
- **Implementation Approach**  
  I introduced a GraphQL server for select queries, partially alongside my existing REST setup. This hybrid approach allowed me to gradually learn GraphQL without fully replacing my REST API immediately.

### 4.2 Performance Bottlenecks & DataLoader

- **What Went Wrong**  
  As I added more complex queries and relationships, I started to see significant performance hits due to repeated database calls.
- **Solution: DataLoader**  
  DataLoader batches and caches requests to avoid redundant lookups. By using it, I reduced the number of trips to the database, drastically improving performance in my GraphQL layer.

---

## 5. Swagger Documentation

### 5.1 Current Manual Process

- **Manual Writing**  
  Right now, I write out every route, parameter, and request body by hand in YAML/JSON files. This is time-consuming and prone to errors if routes change frequently.
- **Challenges**
  - Keeping documentation in sync with code.
  - Ensuring consistency across multiple endpoints.

### 5.2 Future Improvements

- **Auto-Documentation**  
  I’m exploring tools and frameworks that can help automate Swagger generation. Ideally, I’d like to generate the OpenAPI spec based on annotations or definitions in the code, removing the need for manual YAML/JSON documentation.
- **Next Steps**  
  I plan to prototype an auto-documentation setup to see if it’s flexible enough to cover all custom endpoints and reduce manual effort.

---

## 6. Routing & Database Decisions

### 6.1 Routing Convention

- **Use of @remix-run/v1-route-convention**  
  I installed the `@remix-run/v1-route-convention` package because it allows for a more structured file-based routing system. Unlike previous approaches that scattered routes as individual files in one folder, the v1 convention supports using folders to group related routes. This means I can better organize my route files and keep page components in a separate folder.
- **Benefits**
  - Cleaner project structure by grouping routes into folders.
  - Easier maintenance and scalability as the number of routes grows.

### 6.2 Choice of MongoDB

- **Why MongoDB?**  
  Although a SQL database might be more appropriate for a real-world project given its structured data and relational capabilities, I chose MongoDB for this project.
- **Rationale**  
  MongoDB was easier to deploy online using free tools like Atlas. Its flexible schema also allowed for rapid prototyping and iterative development during this learning phase.

---

## 7. Final Thoughts / Next Steps

- **Continue Learning**  
  Although I’ve made significant progress with React, Remix, Zustand, React Hook Form, and GraphQL, there’s still more to learn—especially around advanced optimizations and documentation best practices.
- **Production-Readiness**  
  My goal is to refine this project’s performance, developer experience, and maintainability. That includes:
  - Possibly replacing or enhancing the REST API with a fully-fledged GraphQL API.
  - Fully automating documentation.
  - Further optimizing forms and state management where needed.
