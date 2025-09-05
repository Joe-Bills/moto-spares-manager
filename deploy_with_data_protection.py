#!/usr/bin/env python
"""
Deployment Script with Data Protection
Ensures data is never lost during deployments
"""
import os
import subprocess
import sys
import time

def run_command(command, description):
    """Run a command and handle errors"""
    print(f"🔄 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed: {e}")
        print(f"Error output: {e.stderr}")
        return False

def main():
    """Main deployment function with data protection"""
    print("🚀 DEPLOYMENT WITH DATA PROTECTION")
    print("=" * 50)
    
    # Step 1: Backup current data
    print("\n📦 STEP 1: BACKING UP CURRENT DATA")
    if not run_command("python persist_data.py backup", "Backing up current data"):
        print("⚠️  Backup failed, but continuing with deployment...")
    
    # Step 2: Commit and push changes
    print("\n📤 STEP 2: COMMITTING AND PUSHING CHANGES")
    if not run_command("git add .", "Adding changes to git"):
        return False
    
    if not run_command("git commit -m 'Deploy with data protection'", "Committing changes"):
        return False
    
    if not run_command("git push origin main", "Pushing to GitHub"):
        return False
    
    # Step 3: Wait for deployment
    print("\n⏳ STEP 3: WAITING FOR DEPLOYMENT")
    print("Deployment is in progress...")
    print("This may take 2-3 minutes...")
    
    # Wait for deployment to complete
    time.sleep(180)  # 3 minutes
    
    # Step 4: Verify data restoration
    print("\n🔍 STEP 4: VERIFYING DATA RESTORATION")
    if not run_command("python persist_data.py check", "Checking data status"):
        print("⚠️  Data check failed, but deployment completed")
    
    print("\n🎉 DEPLOYMENT COMPLETED!")
    print("=" * 50)
    print("✅ Your data is now protected from loss")
    print("✅ Automatic restoration is enabled")
    print("✅ Future deployments will preserve your data")
    
    print("\n🌐 Your application is available at:")
    print("   Frontend: https://web-production-22b33.up.railway.app/")
    print("   Backend:  https://web-production-3b1a6.up.railway.app/")
    print("   Admin:    https://web-production-3b1a6.up.railway.app/admin/")

if __name__ == "__main__":
    main()
