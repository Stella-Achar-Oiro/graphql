// queries.js - Updated with dynamic module support
export const USER_INFO_QUERY = `
  {
    user {
      id
      login
    }
  }
`;

// Updated XP query with dynamic eventId
export const getXPQuery = (moduleId) => `
   {
    transaction(
      where: {
        type: {_eq: "xp"},
        eventId: {_eq: ${moduleId}}
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

// Updated progress query with dynamic eventId
export const getProgressQuery = (moduleId) => `
  {
    progress(
      where: {
        eventId: {_eq: ${moduleId}}
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

// Updated results query with dynamic eventId
export const getResultsQuery = (moduleId) => `
  {
    result(
      where: {
        eventId: {_eq: ${moduleId}}
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

// Updated Total XP query with dynamic eventId
export const getTotalXPQuery = (moduleId) => `
  {
    transaction_aggregate(
      where: {
        _and: [
          { type: {_eq: "xp"} },
          { eventId: {_eq: ${moduleId}} }
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

// Updated audit query with dynamic eventId
export const getAuditQuery = (moduleId) => `
  {
    transaction(
      where: {
        _and: [
          { type: {_in: ["up", "down"]} },
          { eventId: {_eq: ${moduleId}} }
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
