import swaggerJsdoc from "swagger-jsdoc";

const swaggerOptions = {
  definition: {
    openapi: "3.1.0",
    info: {
      title: "Financial Manager API",
      version: "1.0.0",
      description: "API documentation for the Financial Manager API",
    },
  },
  apis: ["./app/data/swagger/schemas/**/*.yaml"],
};

export let loader = async () => {
  const swaggerSpec = swaggerJsdoc(swaggerOptions);
  return new Response(JSON.stringify(swaggerSpec), {
    headers: {
      "Content-Type": "application/json",
    },
  });
};
