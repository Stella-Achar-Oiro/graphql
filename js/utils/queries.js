// queries.js
export const USER_INFO_QUERY = `
  {
    user {
      id
      login
    }
  }
`;

// Updated XP query - using eventId instead of path filtering
export const MODULE_75_XP_QUERY = `
   {
    transaction(
      where: {
        _and: [
          { type: {_eq: "xp"} },
          { eventId: {_eq: 75} }
        ]
      },
      order_by: {createdAt: desc}
    ) {
      id
      amount
      createdAt
      path
      objectId
      object {
        id
        name
        type
      }
    }
  }
`;

// Fixed progress query for module 75 - removed nested event reference
export const MODULE_75_PROGRESS_QUERY = `
  {
    progress(
      where: {
        eventId: {_eq: 75}
      },
      order_by: {createdAt: desc}
    ) {
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

// Fixed results query for module 75 - removed nested event reference
export const MODULE_75_RESULTS_QUERY = `
  {
    result(
      where: {
        eventId: {_eq: 75}
      },
      order_by: {createdAt: desc}
    ) {
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

// Total XP query for module 75 (unchanged)
export const TOTAL_MODULE_75_XP_QUERY = `
  {
    transaction_aggregate(
      where: {
        _and: [
          { type: {_eq: "xp"} },
          { eventId: {_eq: 75} }
        ]
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

// Fixed audit query for module 75 - removed nested event reference
export const AUDIT_DATA_QUERY = `
  {
    transaction(
      where: {
        _and: [
          { type: {_in: ["up", "down"]} },
          { eventId: {_eq: 75} }
        ]
      }
    ) {
      id
      type
      amount
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
