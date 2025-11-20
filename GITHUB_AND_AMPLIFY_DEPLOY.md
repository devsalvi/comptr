# GitHub and AWS Amplify Deployment Guide

## 📦 What's Ready

✅ Git repository initialized
✅ All code committed (52 files)
✅ AWS infrastructure deployed
✅ Frontend configured with AWS resources

## 🚀 Step 1: Push to GitHub

### Create GitHub Repository

1. **Go to GitHub**: https://github.com/new

2. **Create new repository**:
   - Repository name: `omnichannel-support-system`
   - Description: `Omnichannel customer support system with React frontend and Python/FastAPI backend`
   - Visibility: Private or Public (your choice)
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)

3. **Copy the repository URL** (you'll need this next)

### Push Your Code

```bash
# Add GitHub as remote origin (replace with your actual repo URL)
git remote add origin https://github.com/YOUR_USERNAME/omnichannel-support-system.git

# Push to GitHub
git branch -M main
git push -u origin main
```

**Alternative: Using GitHub CLI**
```bash
# If you have gh CLI installed
gh repo create omnichannel-support-system --private --source=. --push
```

## 🌐 Step 2: Deploy Frontend to AWS Amplify

### Option A: Deploy via Amplify Console (Recommended)

1. **Open AWS Amplify Console**:
   https://console.aws.amazon.com/amplify/home?region=us-east-1

2. **Click "New app" → "Host web app"**

3. **Connect repository**:
   - Select "GitHub"
   - Authorize AWS Amplify to access your GitHub
   - Select your repository: `omnichannel-support-system`
   - Select branch: `main`

4. **Configure build settings**:

   Amplify should auto-detect the `amplify.yml` file. If not, use this:

   ```yaml
   version: 1
   applications:
     - appRoot: frontend
       frontend:
         phases:
           preBuild:
             commands:
               - npm install
           build:
             commands:
               - npm run build
         artifacts:
           baseDirectory: build
           files:
             - '**/*'
         cache:
           paths:
             - node_modules/**/*
   ```

5. **Add environment variables**:

   Click "Advanced settings" → "Environment variables":

   | Key | Value |
   |-----|-------|
   | `REACT_APP_COGNITO_USER_POOL_ID` | `us-east-1_QcMqBPp39` |
   | `REACT_APP_COGNITO_CLIENT_ID` | `3bvao34ggrm8e8sfbjksf0k36t` |
   | `REACT_APP_AWS_REGION` | `us-east-1` |
   | `REACT_APP_API_URL` | `https://your-api-url` (update later) |

6. **Review and deploy**:
   - Review settings
   - Click "Save and deploy"
   - Wait 3-5 minutes for deployment

7. **Get your URL**:
   - After deployment completes
   - You'll see a URL like: `https://main.d1234abcd.amplifyapp.com`
   - Click to open your app!

### Option B: Deploy via Amplify CLI

```bash
# Install Amplify CLI
npm install -g @aws-amplify/cli

# Configure Amplify
amplify configure

# Initialize Amplify in your project
cd frontend
amplify init

# Add hosting
amplify add hosting

# Publish
amplify publish
```

## 🔐 Step 3: Test Your Deployed App

1. **Visit your Amplify URL**

2. **You should see the login page**

3. **Log in with**:
   - Email: admin@example.com
   - Password: TempPassword123!
   - You'll be prompted to change your password

4. **After login**:
   - You should see the Agent Dashboard
   - Authentication is working via AWS Cognito!
   - Note: Ticket creation won't work yet (needs Lambda API)

## 📝 Step 4: Configure Continuous Deployment

Amplify is now configured for automatic deployment:

- **Push to main branch** → Auto-deploys to production
- **Create feature branch** → Amplify can create preview deployments
- **Pull requests** → Can trigger preview deployments

### Enable Branch Deployments

In Amplify Console:
1. Go to App settings → Branch deployments
2. Enable "Branch autodetection"
3. Create feature branches and they'll auto-deploy!

## 🎯 Current Status

### ✅ What's Working
- Frontend deployed to Amplify
- AWS Cognito authentication
- User login/logout
- DynamoDB tables ready
- Continuous deployment from GitHub

### ⏳ What's Next
- Deploy Lambda API function
- Connect API Gateway
- Update `REACT_APP_API_URL` in Amplify environment variables
- Test full ticket creation flow

## 🔄 How to Update

### Update Code
```bash
# Make changes locally
git add .
git commit -m "Your update message"
git push origin main
```

Amplify will automatically:
1. Detect the push
2. Build the updated app
3. Deploy to production
4. Usually takes 3-5 minutes

### Update Environment Variables

In Amplify Console:
1. Go to App settings → Environment variables
2. Update values
3. Click "Save"
4. Redeploy (or wait for next auto-deploy)

## 💰 Cost Estimate

### GitHub
- Free for public repos
- Free for private repos (within limits)

### AWS Amplify
- Build minutes: $0.01/minute (first 1,000 free/month)
- Hosting: $0.15/GB served (first 15 GB free/month)
- **Estimated**: $0-5/month for low traffic

### Total Current AWS Costs
- DynamoDB: $1-2/month
- Cognito: Free (under 50k users)
- Amplify: $0-5/month
- **Total: $1-7/month**

## 📊 Monitoring

### Amplify Console
https://console.aws.amazon.com/amplify/

Monitor:
- Build status
- Deployment history
- Traffic/bandwidth usage
- Build minutes used

### Enable Notifications

Set up notifications for deployment status:
1. Amplify Console → Notifications
2. Connect to SNS topic or email
3. Get notified of build success/failure

## 🐛 Troubleshooting

### Build Fails
- Check build logs in Amplify Console
- Verify environment variables are set
- Check `package.json` scripts

### App Loads but Login Fails
- Verify Cognito environment variables
- Check browser console for errors
- Ensure Cognito User Pool allows the Amplify domain

### 403 Forbidden on Assets
- Check `amplify.yml` configuration
- Verify build artifacts baseDirectory is correct

## 🎉 Success!

Your app is now:
- ✅ Pushed to GitHub
- ✅ Deployed to AWS Amplify
- ✅ Using AWS Cognito for auth
- ✅ Auto-deploying on git push
- ✅ Accessible via HTTPS

**Next**: Deploy the Lambda API to enable full ticket management!

## 📞 Quick Links

- **Amplify Console**: https://console.aws.amazon.com/amplify/
- **GitHub Repo**: https://github.com/YOUR_USERNAME/omnichannel-support-system
- **Your App URL**: (will be provided after Amplify deployment)
- **Cognito Console**: https://console.aws.amazon.com/cognito/v2/idp/user-pools/us-east-1_QcMqBPp39/users?region=us-east-1
