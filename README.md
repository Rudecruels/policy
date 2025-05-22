# policy

## APIS

1. http://127.0.0.1:3000/api/policy/upload : Api to upload csv and to store in db METHOD: GET
2. http://127.0.0.1:3000/api/policy/policy-by-username?username=Emily: Api to fetch policy by username METHOD:GET
3. http://127.0.0.1:3000/api/policy/aggregate-policy: Api to get the aggregated policy METHOD: GET
4. http://127.0.0.1:3000/api/policy/schedule-message : Api to schedule message : METHOD: POST
   payload
   {
   "message": "Follow-up with client",
   "day": "2025-05-21",
   "time": "22:23:00"
   }
