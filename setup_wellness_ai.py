#!/usr/bin/env python3
"""
Setup script for Wellness AI model training
Installs required packages and runs model training
"""

import subprocess
import sys
import os

def install_packages():
    """Install required Python packages"""
    packages = [
        'tensorflow>=2.12.0',
        'numpy>=1.21.0',
        'tensorflowjs>=4.0.0'
    ]
    
    for package in packages:
        print(f"Installing {package}...")
        subprocess.check_call([sys.executable, '-m', 'pip', 'install', package])

def train_model():
    """Run the model training script"""
    print("Training wellness AI model...")
    try:
        # Run the model training script
        result = subprocess.run([sys.executable, 'src/lib/model_training.py'], 
                              capture_output=True, text=True, cwd=os.getcwd())
        
        if result.returncode == 0:
            print("Model training completed successfully!")
            print(result.stdout)
            
            # Create model directory for Next.js public folder
            model_dir = "public/tfjs_model"
            if not os.path.exists(model_dir):
                os.makedirs(model_dir)
                print(f"Created {model_dir} directory")
                
            # Move model files to public folder (if they exist)
            if os.path.exists("tfjs_model"):
                import shutil
                try:
                    shutil.copytree("tfjs_model", model_dir, dirs_exist_ok=True)
                    print(f"Model files copied to {model_dir}")
                except Exception as e:
                    print(f"Warning: Could not copy model files: {e}")
                    
        else:
            print("Model training failed!")
            print("STDOUT:", result.stdout)
            print("STDERR:", result.stderr)
            
    except Exception as e:
        print(f"Error running model training: {e}")

def main():
    print("Setting up Wellness AI system...")
    
    try:
        install_packages()
        train_model()
        
        print("\n" + "="*50)
        print("Setup completed!")
        print("="*50)
        print("Next steps:")
        print("1. Run 'npm run dev' to start the development server")
        print("2. The AI wellness monitoring will be active on employee dashboards")
        print("3. Configure thresholds via the IT Team dashboard")
        print("4. Monitor wellness alerts on the Doctor dashboard")
        
    except Exception as e:
        print(f"Setup failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
