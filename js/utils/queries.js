// queries.js
export const USER_INFO_QUERY = `
  {
    user {
      id
      login
    }
  }
`;

export const MODULE_75_XP_QUERY = `
  {
    transaction(where: { 
      type: {_eq: "xp"}, 
      path: {_ilike: "%#75%"}
    }) {
      id
      amount
      createdAt
      path
    }
  }
`;

export const MODULE_75_PROGRESS_QUERY = `
  {
    progress(where: {
      path: {_ilike: "%#75%"}
    }) {
      id
      grade
      createdAt
      path
      object {
        id
        name
        type
      }
    }
  }
`;

export const MODULE_75_RESULTS_QUERY = `
  {
    result(where: {
      path: {_ilike: "%#75%"}
    }) {
      id
      grade
      createdAt
      path
      object {
        name
        type
      }
    }
  }
`;

export const TOTAL_MODULE_75_XP_QUERY = `
  {
    transaction_aggregate(
      where: {
        type: {_eq: "xp"},
        path: {_ilike: "%#75%"}
      }
    ) {
      aggregate {
        sum {
          amount
        }
      }
    }
  }
`;

export const AUDIT_DATA_QUERY = `
  {
    transaction(
      where: {
        type: {_in: ["up", "down"]},
        path: {_ilike: "%#75%"}
      }
    ) {
      id
      type
      amount
      createdAt
    }
  }
`;