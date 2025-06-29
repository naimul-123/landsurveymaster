import axios from "axios";

export const postData = async (url, newData) => {
  const response = await axios.post(url, newData, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  return response;
};
export const putData = async (url, newData) => {
  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newData),
  });
  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Network response was not ok:${errorData}`);
  }
  return response.json();
};
export const getData = async (url) => {
  const res = await axios.get(url);
  return res.data;
};
export const deleteData = async (url, data = {}) => {
  const config = data ? { data } : {};
  const res = await axios.delete(url, config);

  return res.data;
};
export const updateData = async (url, data = {}, config = {}) => {
  if (!url) {
    throw new Error("URL is required for PUT request.");
  }
  const response = await axios.put(url, data, config);
  return response;
};
