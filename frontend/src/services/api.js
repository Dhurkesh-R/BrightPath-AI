const BASE_URL = "https://brightpath-ai.onrender.com";
const API_BASE = BASE_URL;

// --- Helper function to get Authorization headers ---
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
  };
  // Only attach the Authorization header if a token exists
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

// --- Core fetch utility with automatic token refresh ---
// NOTE: This function needs to be used by all other authenticated endpoints.
export const fetchWithRefresh = async (url, options = {}) => {
  try {
    // 1. Initial attempt
    let res = await fetch(url, options);

    // 2. If access token is expired (401), attempt refresh
    if (res.status === 401) {
      const refreshToken = localStorage.getItem("refresh_token");
      if (!refreshToken) {
        throw new Error("Session expired. No refresh token found. Please login again.");
      }

      const refreshRes = await fetch(`${API_BASE}/refresh`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${refreshToken}`,
        },
      });

      const refreshJson = await refreshRes.json();
      
      // FIX 1: Ensure new tokens exist on successful refresh
      if (refreshRes.ok && refreshJson.token && refreshJson.refresh_token) {
        // Store new tokens
        localStorage.setItem("token", refreshJson.token);
        localStorage.setItem("refresh_token", refreshJson.refresh_token);

        // Update the authorization header for the original request
        options.headers = options.headers || {};
        options.headers["Authorization"] = `Bearer ${refreshJson.token}`;

        // Retry the original failed request
        res = await fetch(url, options);
      } else {
        // If refresh fails, session is truly expired
        throw new Error("Session expired. Please login again.");
      }
    }
    return res;
  } catch (err) {
    throw err;
  }
};

// ------------------------------------------------------------------
// AUTHENTICATION ENDPOINTS (Do not use fetchWithRefresh)
// ------------------------------------------------------------------

export const loginUser = async (credentials) => {
  const res = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    // FIX 2: Do not use getAuthHeaders for login; credentials don't need a token
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });

  const json = await res.json();

  if (!res.ok) throw new Error(json.error || "Login failed!");

  // FIX 3: CRITICAL BUG FIX - Save the tokens returned by the backend
  if (json.token && json.refresh_token) {
    localStorage.setItem("token", json.token);
    localStorage.setItem("refresh_token", json.refresh_token);
  }
  
  return json;
};

export const registerUser = async (credentials) => {
  const res = await fetch(`${BASE_URL}/register`, {
    method: "POST",
    // FIX 2: Do not use getAuthHeaders for registration
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });

  const json = await res.json();

  if (!res.ok) throw new Error(json.error || "Registration failed!");
  
  // FIX 3: If registration also returns tokens, save them
  if (json.token && json.refresh_token) {
    localStorage.setItem("token", json.token);
    localStorage.setItem("refresh_token", json.refresh_token);
  }
  return json;
};

// ------------------------------------------------------------------
// GENERAL UTILITY ENDPOINTS (Now use fetchWithRefresh)
// ------------------------------------------------------------------

export const chatBot = async (prompt) => {
  const res = await fetchWithRefresh(`${BASE_URL}/chat-bot`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ prompt }),
  });
  
  if (!res.ok) {
    // This will handle the case where fetchWithRefresh failed to get a 200 after retry
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(`Chatbot error! Status: ${res.status}. ${errorBody.error || 'Server error.'}`);
  }
  
  const json = await res.json();
  return json.response;
};

// NOTE: The backend did not have a /mood endpoint. Keeping this function as is,
// but it will likely return a 404 until that route is implemented.
export const mood = async (userId, mood) => {
  const res = await fetchWithRefresh(`${BASE_URL}/mood`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ userId: userId, mood: mood }),
  });
  const json = await res.json();
  return json;
};

export const getSkills = async (input) => {
  const res = await fetchWithRefresh(`${BASE_URL}/skill-interests`, {
    method: "POST",
    headers: getAuthHeaders(),
    // Assuming backend ML expects the input object directly, not wrapped in {input: ...}
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(`Failed to fetch skills. Status: ${res.status}`);
  const json = await res.json();
  return json;
};

export const getLearningStyle = async (input) => {
  const res = await fetchWithRefresh(`${BASE_URL}/learning-style`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(`Failed to fetch learning style. Status: ${res.status}`);
  const json = await res.json();
  return json;
};

export const getPersonality = async (input) => {
  // FIX 4: Corrected endpoint from /learning-style to /personality
  const res = await fetchWithRefresh(`${BASE_URL}/personality`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(`Failed to fetch personality. Status: ${res.status}`);
  const json = await res.json();
  return json;
};

export const getEmotions = async (input) => {
  // FIX 4: Corrected endpoint from /learning-style to /emotion-analysis
  const res = await fetchWithRefresh(`${BASE_URL}/emotion-analysis`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(`Failed to fetch emotions. Status: ${res.status}`);
  const json = await res.json();
  return json;
};

export const getHealth = async (input) => {
  // FIX 4: Corrected endpoint from /learning-style to /physical-activity-health
  const res = await fetchWithRefresh(`${BASE_URL}/physical-activity-health`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(`Failed to fetch health. Status: ${res.status}`);
  const json = await res.json();
  return json;
};

export const getSuccessPath = async (input) => {
  // NOTE: /recommendations doesn't take an input in app.py, but passing it here just in case.
  const res = await fetchWithRefresh(`${BASE_URL}/recommendations`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(`Failed to fetch success path. Status: ${res.status}`);
  const json = await res.json();
  return json;
};

export const getAcademicRisk = async (input) => {
  const res = await fetchWithRefresh(`${BASE_URL}/risks/1`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(`Failed to fetch academic risk. Status: ${res.status}`);
  const json = await res.json();
  return json;
};

export const getEmotionalRisk = async (input) => {
  const res = await fetchWithRefresh(`${BASE_URL}/risks/2`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(`Failed to fetch emotional risk. Status: ${res.status}`);
  const json = await res.json();
  return json;
};

export const getHealthRisk = async (input) => {
  const res = await fetchWithRefresh(`${BASE_URL}/risks/3`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(`Failed to fetch health risk. Status: ${res.status}`);
  const json = await res.json();
  return json;
};

export const fetchActivities = async () => {
  const res = await fetchWithRefresh(`${BASE_URL}/activities`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch activities. Status: ${res.status}`);
  }

  return await res.json(); // ✅ return array directly
};


export const addActivity = async (activity) => {
  const res = await fetchWithRefresh(`${BASE_URL}/activities`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(activity),
  });
  if (!res.ok) throw new Error(`Failed to add activity. Status: ${res.status}`);
  const json = await res.json();
  return json.activity;
}

export async function updateActivity(id, payload) {
  const res = await fetchWithRefresh(`${BASE_URL}/activities/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to update activity");
  const data = await res.json();
  return data.activity;
}

export async function deleteActivity(id) {
  const res = await fetchWithRefresh(`${BASE_URL}/activities/${id}`, {
      method: "DELETE", 
      headers: getAuthHeaders()
    });
  if (!res.ok) throw new Error("Failed to delete activity");
  return res.json();
}

export const getUserProfile = async () => {
  const res = await fetchWithRefresh(`${BASE_URL}/profile`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to fetch profile. Status: ${res.status}`);
  const json = await res.json();
  return json
}

export async function updateUserProfile(input) {
  const res = await fetchWithRefresh(`${BASE_URL}/profile`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("Failed to update profile");
  const data = await res.json();
  return data.user;
}

export async function getDailyQuiz() {
  const res = await fetchWithRefresh(`${BASE_URL}/daily-quiz`, {
        method: "GET",
        headers: getAuthHeaders(),
      });
  if (!res.ok) throw new Error("Failed to load quiz");
  return res.json();
}

export async function sendQuizResults(summary_data) {
    const res = await fetchWithRefresh(`${BASE_URL}/send-quiz-results`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(summary_data),
    });
    if (!res.ok) throw new Error(`Failed to send answers. Status: ${res.status}`);
    const json = await res.json();
    return json;
  }

export async function sendChatData(messages) {
  const res = await fetchWithRefresh(`${BASE_URL}/send-chat-log`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      messages: messages
    }),
  });

  if (!res.ok) {
    throw new Error(`Failed to send chat logs. Status: ${res.status}`);
  }

  return await res.json();
}


export async function getStudentDashboard(userId) {
  const res = await fetchWithRefresh(`${BASE_URL}/student-profile/${userId}`, {
        method: "GET",
        headers: getAuthHeaders(),
      });
  if (!res.ok) throw new Error("Failed to load quiz");
  return res.json();
}
// Goals API
export const getGoals = async () => {
  const res = await fetchWithRefresh(`${BASE_URL}/goals`, {
        method: "GET",
        headers: getAuthHeaders(),
      });
    if (!res.ok) throw new Error("Failed to load goals");
    return res.json();
};

export const createGoal = async (goalData) => {
  const res = await fetchWithRefresh(`${BASE_URL}/goals`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(goalData),
      });
      if (!res.ok) throw new Error(`Failed to send goal data. Status: ${res.status}`);
      const json = await res.json();
      return json;
};

export const updateGoal = async (goalId, updates) => {
  const res = await fetchWithRefresh(`${BASE_URL}/goals/${goalId}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error("Failed to update profile");
      const data = await res.json();
      return data;
};

export const deleteGoal = async (goalId) => {
  const res = await fetchWithRefresh(`${BASE_URL}/goals/${goalId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to delete goal");
  return res.json();
};

// Books API
export const getBooks = async () => {
  const res = await fetchWithRefresh(`${BASE_URL}/books`, {
        method: "GET",
        headers: getAuthHeaders(),
      });
    if (!res.ok) throw new Error("Failed to load books");
    return res.json();
};

export const uploadBook = async (formData) => {
  const res = await fetchWithRefresh(`${BASE_URL}/upload-book`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || `Upload failed (${res.status})`);
  }

  return res.json();
};


export const deleteBook = async (bookId) => {
  const res = await fetchWithRefresh(`${BASE_URL}/books/${bookId}`, {
          method: "DELETE", 
          headers: getAuthHeaders()
        });
      if (!res.ok) throw new Error("Failed to delete book");
      return res.json();
};

export const changePassword = async (payload) => {
  const res = await fetchWithRefresh(`${BASE_URL}/change-password`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to change password");
  }

  return res.json();
};

export const fetchStudents = async ({ grade, section, search }) => {
  const params = new URLSearchParams();

  if (grade && grade !== "all") params.append("grade", grade);
  if (section && section !== "all") params.append("section", section);
  if (search) params.append("search", search);

  // 1. Fetch the data
  const response = await fetchWithRefresh(
    `${BASE_URL}/students?${params.toString()}`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    }
  );

  // 2. MUST await the .json() method call
  const result = await response.json();

  // 3. Log and return
  console.log("Students API Data:", result.data);
  
  // Return the array from the "data" key as defined in your Flask backend
  return Array.isArray(result?.data) ? result.data : [];
};


export const loadAnalytics = async (gradeFilter, subjectFilter) => {
  const res = await fetchWithRefresh(
    `${BASE_URL}/analytics/class-summary?grade=${gradeFilter}&section=B`, {
      method: "GET",
      headers: getAuthHeaders(),
    }
  );
  return res.json()
}

export const loadTeacherStats = async () => {
  const res = await fetchWithRefresh(
    `${BASE_URL}/teacher-stats`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    }
  );
  return res.json();
};

export const loadTeacherPerformance = async () => {
  const res = await fetchWithRefresh(
    `${BASE_URL}/performance-data`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    }
  );
  return res.json();
};

export const loadRecentBooks = async () => {
  const res = await fetchWithRefresh(
    `${BASE_URL}/books/recent`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    }
  );
  return res.json();
};

export const getInterventions = async (grade, section) => {
    const params = new URLSearchParams();

  if (grade && grade !== "all") params.append("grade", grade);
  if (section && section !== "all") params.append("section", section);

  const res = await fetchWithRefresh(
    `${BASE_URL}/interventions?${params.toString()}`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    }
  );
  return res.json();
};



export const fetchAssignments = async () => {
  const res = await fetchWithRefresh(`${BASE_URL}/assignments`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch activities. Status: ${res.status}`);
  }

  return await res.json(); // ✅ return array directly
};


export const addAssignment = async (activity) => {
  const res = await fetchWithRefresh(`${BASE_URL}/assignments`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(activity),
  });
  if (!res.ok) throw new Error(`Failed to add activity. Status: ${res.status}`);
  const json = await res.json();
  return json.activity;
}

export async function updateAssignment(id, payload) {
  const res = await fetchWithRefresh(`${BASE_URL}/assignments/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to update activity");
  const data = await res.json();
  return data.activity;
}

export async function deleteAssignment(id) {
  const res = await fetchWithRefresh(`${BASE_URL}/assignments/${id}`, {
      method: "DELETE", 
      headers: getAuthHeaders()
    });
  if (!res.ok) throw new Error("Failed to delete activity");
  return res.json();
}

// api.js (messages APIs)

export const getMessages = async () => {
  const res = await fetchWithRefresh(`${BASE_URL}/messages/conversations`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error("Failed to fetch conversations");
  }

  return await res.json();
};


export const getMessageThread = async (userId) => {
  const res = await fetchWithRefresh(
    `${BASE_URL}/messages/thread/${userId}`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch messages");
  }

  return await res.json();
};


export const sendMessage = async ( receiverId, content ) => {
  const res = await fetchWithRefresh(`${BASE_URL}/messages/send`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ receiverId, content }),
  });

  if (!res.ok) {
    throw new Error("Failed to send message");
  }

  return await res.json();
};


export const markThreadRead = async (userId) => {
  const res = await fetchWithRefresh(
    `${BASE_URL}/messages/mark-read/${userId}`,
    {
      method: "POST",
      headers: getAuthHeaders(),
    }
  );

  return await res.json();
};

export const getParentsForTeacher = async () => {
  const res = await fetchWithRefresh(`${BASE_URL}/teachers/parents`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  return res.json();
};

export const getParentReport = async (period) => {
  const res = await fetchWithRefresh(`${BASE_URL}/parent/reports?period=${period}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch reports. Status: ${res.status}`);
  }
  
  return res.json();
};

export const getTeachersForParent = async () => {
  const res = await fetchWithRefresh(`${BASE_URL}/parent/teachers`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  return res.json();
};


export const getParentProgress = async (period) => {
  const res = await fetchWithRefresh(`${BASE_URL}/parent/progress?period=${period}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch progress. Status: ${res.status}`);
  }
  
  return res.json();
};

export async function fetchParentRecommendations() {
  const res = await fetch(`${BASE_URL}/parent/recommendations`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch recommendations");
  return res.json();
}

export async function fetchParentNotifications() {
  const res = await fetch(`${BASE_URL}/parent/notifications`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch notifications");
  return res.json();
}

export const markNotificationRead = async (id) => {
  const res = await fetchWithRefresh(`${BASE_URL}/parent/notifications/${id}/read`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to mark notification. Status: ${res.status}`);
  const json = await res.json();
  return json;
}
