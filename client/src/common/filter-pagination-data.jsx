import axios from "axios";

const filterPaginationData = async ({
  create_new_arr = false,
  state,
  data,
  page,
  countRoute,
  data_to_send = {}
}) => {
  if (data != null && !create_new_arr && state && state.results) {
    return {
      ...state,
      results: [...state.results, ...data],
      page: page
    };
  }

  try {
    const { data: { totalDocs } } = await axios.post(
      import.meta.env.VITE_SERVER_DOMAIN + countRoute,
      data_to_send
    );

    return {
      results: data,
      page: 1,
      totalDocs
    };
  } catch (err) {
    console.log(err);
  }
};

export default filterPaginationData;
