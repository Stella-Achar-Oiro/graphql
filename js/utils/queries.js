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

// Updated progress query for module 75
export const MODULE_75_PROGRESS_QUERY = `
  {
    progress(
      where: {
        object: {
          event: {
            id: {_eq: 75}
          }
        }
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

// Updated results query for module 75
export const MODULE_75_RESULTS_QUERY = `
  {
    result(
      where: {
        object: {
          event: {
            id: {_eq: 75}
          }
        }
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

// Updated total XP query for module 75
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

// Updated audit query for module 75
export const AUDIT_DATA_QUERY = `
  {
    transaction(
      where: {
        _and: [
          { type: {_in: ["up", "down"]} },
          { object: { event: { id: {_eq: 75} } } }
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