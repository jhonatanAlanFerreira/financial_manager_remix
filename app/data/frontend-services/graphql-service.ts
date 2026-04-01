import toast from "react-hot-toast";

const GRAPHQL_ENDPOINT = "/api/graphql";

export async function fetchGraphQL(
  query: string,
  variables: Record<string, any> = {}
) {
  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    const result = await response.json();

    if (response.ok && result.data) {
      return result.data;
    } else {
      const errorMessage =
        result.errors
          ?.map((error: { message: string }) => error.message)
          .join(", ") || "Unknown error";
      throw new Error(`GraphQL Error: ${errorMessage}`);
    }
  } catch (error) {
    toast.error("Sorry, unexpected error. Be back soon");
    throw error;
  }
}
