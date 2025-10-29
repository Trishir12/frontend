# 🔧 TROUBLESHOOTING GUIDE

## Common Issues and Solutions

### 1. "Network Error" or "Failed to fetch"

**Symptoms:**
- Frontend shows "Network Error"
- API calls fail
- Can't login or register

**Solutions:**

#### Check if all services are running:
```bash
# Check User Service
curl http://localhost:9010/actuator/health

# Check Product Service
curl http://localhost:9011/products

# Check Order Service
curl http://localhost:9013/actuator/health

# Check Frontend
curl http://localhost:5175
```

#### Restart services if needed:
```bash
# Kill all services
lsof -ti:9010 | xargs kill -9
lsof -ti:9011 | xargs kill -9
lsof -ti:9012 | xargs kill -9
lsof -ti:9013 | xargs kill -9

# Restart User Service
cd /Users/trishiry/ecommerce-platform/backend/user-service/user-service
export JAVA_HOME=$(/usr/libexec/java_home -v 21)
./gradlew bootRun &

# Restart Product Service
cd /Users/trishiry/Downloads/product-services
export JAVA_HOME=$(/usr/libexec/java_home -v 21)
./gradlew bootRun &

# Restart Merchant Service
cd /Users/trishiry/ecommerce-platform/backend/merchant-service/merchant-service-final
export JAVA_HOME=$(/usr/libexec/java_home -v 21)
./gradlew bootRun &

# Restart Order Service
cd /Users/trishiry/Downloads/order-service
export JAVA_HOME=$(/usr/libexec/java_home -v 21)
./gradlew bootRun &
```

---

### 2. "Password must be at least 8 characters"

**Symptoms:**
- Registration fails with password error

**Solution:**
- Use a password with at least 8 characters
- Example: `mypassword123` or `test12345`

---

### 3. "Product does not have merchant data"

**Symptoms:**
- Can't add products to cart
- Error message about missing merchant data

**Solution:**
This has been fixed! If you still see this error:
1. Clear browser cache
2. Hard refresh the page (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)
3. Check browser console for errors

---

### 4. "Invalid credentials" or "User not found"

**Symptoms:**
- Can't login with existing credentials

**Solutions:**

#### Option 1: Use test user
- Email: `testuser@test.com`
- Password: `test12345`

#### Option 2: Register new user
1. Go to http://localhost:5175/register
2. Create new account
3. Login with new credentials

#### Option 3: Check database
```bash
# Check if user exists in database
mysql -u root -proot@123 -e "SELECT * FROM user_service.users WHERE email='testuser@test.com';"
```

---

### 5. Cart is empty after adding items

**Symptoms:**
- Added items to cart but cart shows empty
- Cart count doesn't update

**Solutions:**

#### Check if you're logged in:
1. Make sure you're logged in as END_USER
2. Check if token is stored: Open browser console → Application → Local Storage → Check for `accessToken`

#### Verify cart API:
```bash
# Get token from login
TOKEN=$(curl -s -X POST http://localhost:9010/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"testuser@test.com","password":"test12345"}' | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

# Check cart
curl -X GET http://localhost:9013/cart/get/1 \
  -H "Authorization: Bearer $TOKEN"
```

---

### 6. Checkout fails or cart doesn't clear

**Symptoms:**
- Checkout button doesn't work
- Cart items remain after checkout
- Error: "No EntityManager with actual transaction available"

**Solution:**
This has been fixed with `@Transactional` annotation. If you still see this:

1. Restart Order Service:
```bash
lsof -ti:9013 | xargs kill -9
cd /Users/trishiry/Downloads/order-service
export JAVA_HOME=$(/usr/libexec/java_home -v 21)
./gradlew clean bootRun
```

---

### 7. Port already in use

**Symptoms:**
- Service fails to start
- Error: "Port 9010 is already in use"

**Solution:**
```bash
# Find and kill process using the port
lsof -ti:9010 | xargs kill -9  # For User Service
lsof -ti:9011 | xargs kill -9  # For Product Service
lsof -ti:9012 | xargs kill -9  # For Merchant Service
lsof -ti:9013 | xargs kill -9  # For Order Service
lsof -ti:5175 | xargs kill -9  # For Frontend

# Then restart the service
```

---

### 8. Database connection error

**Symptoms:**
- Service fails to start
- Error: "Unable to connect to database"
- Error: "Access denied for user 'root'"

**Solutions:**

#### Check MySQL is running:
```bash
mysql -u root -proot@123 -e "SELECT 1;"
```

#### Check databases exist:
```bash
mysql -u root -proot@123 -e "SHOW DATABASES;"
```

#### Create databases if missing:
```bash
mysql -u root -proot@123 -e "
CREATE DATABASE IF NOT EXISTS user_service;
CREATE DATABASE IF NOT EXISTS checkout_service;
CREATE DATABASE IF NOT EXISTS merchants;
"
```

#### Check MongoDB is running:
```bash
mongosh --eval "db.version()"
```

---

### 9. Frontend shows blank page

**Symptoms:**
- Browser shows blank white page
- No errors in console

**Solutions:**

#### Check frontend is running:
```bash
cd /Users/trishiry/ecommerce-frontend
npm run dev
```

#### Clear browser cache:
1. Open browser DevTools (F12)
2. Right-click refresh button
3. Select "Empty Cache and Hard Reload"

#### Check for JavaScript errors:
1. Open browser console (F12)
2. Look for red error messages
3. Share errors for debugging

---

### 10. CORS errors in browser console

**Symptoms:**
- Error: "Access to fetch at 'http://localhost:9010' from origin 'http://localhost:5175' has been blocked by CORS policy"

**Solution:**
All services have CORS configured. If you still see this:

1. Check Order Service CORS configuration:
```bash
grep -r "@CrossOrigin" /Users/trishiry/Downloads/order-service/src
```

2. Restart the service showing CORS error

---

### 11. JWT token expired

**Symptoms:**
- Suddenly logged out
- Error: "Token expired"
- API calls return 401 Unauthorized

**Solution:**
1. Login again to get new token
2. Token expires after 60 minutes
3. Refresh token valid for 15 days

---

### 12. Products not showing images

**Symptoms:**
- Products show placeholder images
- Images show broken icon

**Solution:**
This is expected if images are stored locally on backend. The platform is working correctly - images are served from `/images/` path on Product Service.

To fix:
1. Make sure Product Service is running
2. Images should be in: `/Users/trishiry/Downloads/product-services/src/main/resources/static/images/`

---

## Quick Health Check Script

Save this as `check_health.sh`:

```bash
#!/bin/bash

echo "=== ECOMMERCE PLATFORM HEALTH CHECK ==="
echo ""

# Check User Service
if curl -s http://localhost:9010/auth/validate >/dev/null 2>&1; then
    echo "✅ User Service (9010): RUNNING"
else
    echo "❌ User Service (9010): DOWN"
fi

# Check Product Service
if curl -s http://localhost:9011/products >/dev/null 2>&1; then
    echo "✅ Product Service (9011): RUNNING"
else
    echo "❌ Product Service (9011): DOWN"
fi

# Check Merchant Service
if lsof -ti:9012 >/dev/null 2>&1; then
    echo "✅ Merchant Service (9012): RUNNING"
else
    echo "❌ Merchant Service (9012): DOWN"
fi

# Check Order Service
if lsof -ti:9013 >/dev/null 2>&1; then
    echo "✅ Order Service (9013): RUNNING"
else
    echo "❌ Order Service (9013): DOWN"
fi

# Check Frontend
if curl -s http://localhost:5175 >/dev/null 2>&1; then
    echo "✅ Frontend (5175): RUNNING"
else
    echo "❌ Frontend (5175): DOWN"
fi

echo ""
echo "=== END HEALTH CHECK ==="
```

Run with:
```bash
chmod +x check_health.sh
./check_health.sh
```

---

## Getting Help

If you encounter issues not covered here:

1. **Check browser console** (F12) for JavaScript errors
2. **Check backend logs** in the terminal where services are running
3. **Verify all services are running** using the health check script
4. **Check database connectivity** using MySQL/MongoDB clients
5. **Review configuration files** in `application.properties` and `.env`

---

## Useful Commands

### View running processes:
```bash
lsof -i :9010  # User Service
lsof -i :9011  # Product Service
lsof -i :9012  # Merchant Service
lsof -i :9013  # Order Service
lsof -i :5175  # Frontend
```

### View service logs:
Check the terminal where each service is running for real-time logs.

### Test API endpoints:
```bash
# Test registration
curl -X POST http://localhost:9010/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"test12345","role":"END_USER"}'

# Test login
curl -X POST http://localhost:9010/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test12345"}'

# Test products
curl http://localhost:9011/products
```

---

**For additional help, refer to PLATFORM_READY.md for complete documentation.**

