import swaggerJsdoc from "swagger-jsdoc";

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Financial Manager App",
      version: "1.0.0",
      description: "API documentation for the Financial Manager App",
    },
  },
  apis: ["./app/routes/api/**/*.tsx"],
};

export let loader = async () => {
  const swaggerSpec = swaggerJsdoc(swaggerOptions);
  return new Response(JSON.stringify(swaggerSpec), {
    headers: {
      "Content-Type": "application/json",
    },
  });
};
