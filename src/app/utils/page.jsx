"use client";
import Cookies from "js-cookie";

// Set token in cookies
export const setAuthToken = (token) => {
  Cookies.set("token", token, { expires: 7 }); // Token expires in 7 days
};

// Retrieve token from cookies
export const getAuthToken = () => {
  const token = Cookies.get("token");
  return token || null; // Return null if the token doesn't exist
};

// Remove token from cookies
export const removeAuthToken = () => {
  Cookies.remove("token");
};