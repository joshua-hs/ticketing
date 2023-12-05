import axios from "axios";
import { useState } from "react";

const useRequest = ({ url, method, body, onSuccess }) => {
  const [errors, setErrors] = useState(null);

  const doRequest = async (props = {}) => {
    try {
      const response = await axios[method](url, { ...body, ...props });
      setErrors(null);

      if (onSuccess) {
        onSuccess(response.data);
      }

      return response.data;
    } catch (err) {
      console.log(err);
      setErrors(
        <div className="alert alert-danger">
          <h4>Oops..</h4>
          <ul className="my-0"></ul>
          {err.response.data.errors.map((error) => (
            <li key={error.message}>{error.message}</li>
          ))}
        </div>
      );
    }
  };

  return { doRequest, errors };
};

export default useRequest;
