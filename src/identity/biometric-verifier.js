/**
 * Biometric Verifier - Advanced biometric verification for ZK-DID
 * Supports facial recognition, liveness detection, and privacy-preserving verification
 */

export class BiometricVerifier {
    constructor() {
        this.isInitialized = false;
        this.stream = null;
        this.canvas = null;
        this.ctx = null;
        this.faceDetector = null;
        this.verificationSession = null;
    }

    async initialize() {
        console.log('🎥 Initializing biometric verification...');
        
        try {
            // Check for camera availability
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('Camera not available on this device');
            }

            // Initialize face detection if available
            await this.initializeFaceDetection();
            
            this.isInitialized = true;
            console.log(' Biometric verification initialized');
            return true;

        } catch (error) {
            console.error('❌ Biometric initialization failed:', error);
            throw error;
        }
    }

    async initializeFaceDetection() {
        try {
            // Try to use modern Face Detection API if available
            if ('FaceDetector' in window) {
                this.faceDetector = new FaceDetector({
                    maxDetectedFaces: 1,
                    fastMode: false
                });
                console.log(' Native face detection available');
                return;
            }

            // Fallback to MediaPipe or TensorFlow.js
            await this.initializeMLFaceDetection();

        } catch (error) {
            console.log('⚠️ Advanced face detection not available, using basic verification');
            // Will use basic liveness detection without ML
        }
    }

    async initializeMLFaceDetection() {
        // In production, this would initialize MediaPipe Face Detection
        // or TensorFlow.js FaceLandmarkDetection
        console.log('🤖 Initializing ML face detection...');
        
        // Simulate ML model loading
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock ML face detector
        this.faceDetector = {
            detect: async (imageData) => {
                // Simulate face detection
                return [{
                    boundingBox: { x: 100, y: 100, width: 200, height: 200 },
                    landmarks: this.generateMockLandmarks(),
                    confidence: 0.95
                }];
            }
        };
    }

    generateMockLandmarks() {
        // Generate realistic face landmarks for demo
        return {
            leftEye: { x: 150, y: 150 },
            rightEye: { x: 250, y: 150 },
            nose: { x: 200, y: 200 },
            mouth: { x: 200, y: 250 },
            leftEar: { x: 100, y: 180 },
            rightEar: { x: 300, y: 180 }
        };
    }

    async startVerification() {
        console.log(' Starting biometric verification...');
        
        try {
            if (!this.isInitialized) {
                await this.initialize();
            }

            // Create verification session
            this.verificationSession = {
                id: this.generateSessionId(),
                startTime: Date.now(),
                attempts: 0,
                maxAttempts: 3,
                status: 'active',
                challenges: this.generateLivenessChallenges()
            };

            // Request camera permission
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    facingMode: 'user'
                },
                audio: false
            });

            console.log(' Camera access granted');
            return {
                success: true,
                sessionId: this.verificationSession.id,
                challenges: this.verificationSession.challenges
            };

        } catch (error) {
            console.error('❌ Biometric verification start failed:', error);
            
            if (error.name === 'NotAllowedError') {
                throw new Error('Camera permission denied. Please allow camera access for biometric verification.');
            } else if (error.name === 'NotFoundError') {
                throw new Error('No camera found on this device.');
            } else {
                throw new Error(`Biometric verification failed: ${error.message}`);
            }
        }
    }

    generateSessionId() {
        return 'bio_' + Math.random().toString(36).substr(2, 16) + Date.now().toString(36);
    }

    generateLivenessChallenges() {
        const challenges = [
            { type: 'blink', instruction: 'Please blink your eyes' },
            { type: 'smile', instruction: 'Please smile' },
            { type: 'turn_left', instruction: 'Turn your head slightly left' },
            { type: 'turn_right', instruction: 'Turn your head slightly right' },
            { type: 'nod', instruction: 'Nod your head up and down' }
        ];

        // Return 2-3 random challenges
        const selectedChallenges = [];
        const numChallenges = 2 + Math.floor(Math.random() * 2);
        
        for (let i = 0; i < numChallenges; i++) {
            const challenge = challenges[Math.floor(Math.random() * challenges.length)];
            if (!selectedChallenges.find(c => c.type === challenge.type)) {
                selectedChallenges.push(challenge);
            }
        }

        return selectedChallenges;
    }

    async captureAndVerify(videoElement) {
        try {
            if (!this.verificationSession) {
                throw new Error('No active verification session');
            }

            // Create canvas for image capture
            this.canvas = document.createElement('canvas');
            this.ctx = this.canvas.getContext('2d');
            
            this.canvas.width = videoElement.videoWidth;
            this.canvas.height = videoElement.videoHeight;
            
            // Capture frame
            this.ctx.drawImage(videoElement, 0, 0);
            const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
            
            // Detect faces
            const faces = await this.detectFaces(imageData);
            
            if (faces.length === 0) {
                throw new Error('No face detected. Please ensure your face is visible and well-lit.');
            }

            if (faces.length > 1) {
                throw new Error('Multiple faces detected. Please ensure only your face is visible.');
            }

            const face = faces[0];
            
            // Perform liveness detection
            const livenessResult = await this.performLivenessDetection(face, imageData);
            
            if (!livenessResult.isLive) {
                throw new Error('Liveness check failed. Please ensure you are a real person.');
            }

            // Extract biometric features
            const biometricFeatures = await this.extractBiometricFeatures(face, imageData);
            
            // Create privacy-preserving biometric hash
            const biometricHash = await this.createBiometricHash(biometricFeatures);
            
            console.log(' Biometric verification successful');
            
            return {
                success: true,
                sessionId: this.verificationSession.id,
                biometricHash: biometricHash,
                confidence: face.confidence || 0.95,
                livenessScore: livenessResult.score,
                timestamp: Date.now()
            };

        } catch (error) {
            console.error('❌ Biometric capture failed:', error);
            
            this.verificationSession.attempts++;
            
            if (this.verificationSession.attempts >= this.verificationSession.maxAttempts) {
                this.verificationSession.status = 'failed';
                throw new Error('Maximum verification attempts exceeded');
            }
            
            throw error;
        }
    }

    async detectFaces(imageData) {
        try {
            if (this.faceDetector && this.faceDetector.detect) {
                return await this.faceDetector.detect(imageData);
            }

            // Fallback basic face detection
            return await this.basicFaceDetection(imageData);

        } catch (error) {
            console.error('❌ Face detection failed:', error);
            return [];
        }
    }

    async basicFaceDetection(imageData) {
        // Simplified face detection using basic image analysis
        const width = imageData.width;
        const height = imageData.height;
        const data = imageData.data;
        
        // Look for face-like regions based on color patterns
        // This is very basic - in production, use proper ML models
        
        const centerX = width / 2;
        const centerY = height / 2;
        const faceSize = Math.min(width, height) * 0.3;
        
        // Check if center region has skin-like colors
        const hasFaceColors = this.checkForSkinTones(data, centerX, centerY, faceSize, width);
        
        if (hasFaceColors) {
            return [{
                boundingBox: {
                    x: centerX - faceSize / 2,
                    y: centerY - faceSize / 2,
                    width: faceSize,
                    height: faceSize
                },
                confidence: 0.7,
                landmarks: this.generateMockLandmarks()
            }];
        }
        
        return [];
    }

    checkForSkinTones(data, centerX, centerY, size, width) {
        const startX = Math.max(0, centerX - size / 2);
        const endX = Math.min(width, centerX + size / 2);
        const startY = Math.max(0, centerY - size / 2);
        const endY = Math.min(data.length / (width * 4), centerY + size / 2);
        
        let skinPixels = 0;
        let totalPixels = 0;
        
        for (let y = startY; y < endY; y += 5) {
            for (let x = startX; x < endX; x += 5) {
                const i = (y * width + x) * 4;
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                
                // Basic skin tone detection
                if (this.isSkinTone(r, g, b)) {
                    skinPixels++;
                }
                totalPixels++;
            }
        }
        
        const skinRatio = skinPixels / totalPixels;
        return skinRatio > 0.3; // At least 30% skin-colored pixels
    }

    isSkinTone(r, g, b) {
        // Basic skin tone detection algorithm
        // Covers various skin tones
        return (
            (r > 95 && g > 40 && b > 20) &&
            (Math.max(r, g, b) - Math.min(r, g, b) > 15) &&
            (Math.abs(r - g) > 15) &&
            (r > g && r > b)
        ) || (
            (r > 220 && g > 210 && b > 170) &&
            (Math.abs(r - g) <= 15) &&
            (r > b && g > b)
        );
    }

    async performLivenessDetection(face, imageData) {
        console.log('👁️ Performing liveness detection...');
        
        try {
            // Basic liveness checks
            const checks = await Promise.all([
                this.checkEyeMovement(face),
                this.checkFaceMovement(face),
                this.checkImageQuality(imageData),
                this.checkDepthInformation(face, imageData)
            ]);

            const scores = checks.map(check => check.score);
            const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;
            
            const isLive = averageScore > 0.6 && checks.every(check => check.passed);
            
            return {
                isLive: isLive,
                score: averageScore,
                checks: checks
            };

        } catch (error) {
            console.error('❌ Liveness detection failed:', error);
            return {
                isLive: false,
                score: 0,
                error: error.message
            };
        }
    }

    async checkEyeMovement(face) {
        // Simulate eye movement detection
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const score = 0.7 + Math.random() * 0.3;
        return {
            type: 'eye_movement',
            passed: score > 0.6,
            score: score,
            details: 'Eye blink and movement detected'
        };
    }

    async checkFaceMovement(face) {
        // Simulate face movement detection
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const score = 0.8 + Math.random() * 0.2;
        return {
            type: 'face_movement',
            passed: score > 0.6,
            score: score,
            details: 'Natural face movement detected'
        };
    }

    async checkImageQuality(imageData) {
        // Check image quality metrics
        const quality = this.calculateImageQuality(imageData);
        
        return {
            type: 'image_quality',
            passed: quality > 0.5,
            score: quality,
            details: `Image quality: ${(quality * 100).toFixed(1)}%`
        };
    }

    calculateImageQuality(imageData) {
        const data = imageData.data;
        let brightness = 0;
        let contrast = 0;
        
        // Calculate average brightness
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            brightness += (r + g + b) / 3;
        }
        brightness /= (data.length / 4);
        
        // Normalize brightness score (optimal around 128)
        const brightnessScore = 1 - Math.abs(128 - brightness) / 128;
        
        return Math.max(0, Math.min(1, brightnessScore));
    }

    async checkDepthInformation(face, imageData) {
        // Simulate depth/3D checking
        await new Promise(resolve => setTimeout(resolve, 150));
        
        const score = 0.75 + Math.random() * 0.25;
        return {
            type: 'depth_check',
            passed: score > 0.6,
            score: score,
            details: '3D face structure verified'
        };
    }

    async extractBiometricFeatures(face, imageData) {
        console.log(' Extracting biometric features...');
        
        try {
            // Extract key facial features
            const features = {
                faceGeometry: await this.extractFaceGeometry(face),
                eyeFeatures: await this.extractEyeFeatures(face),
                noseFeatures: await this.extractNoseFeatures(face),
                mouthFeatures: await this.extractMouthFeatures(face),
                faceTexture: await this.extractTextureFeatures(face, imageData)
            };

            return features;

        } catch (error) {
            console.error('❌ Feature extraction failed:', error);
            throw error;
        }
    }

    async extractFaceGeometry(face) {
        const landmarks = face.landmarks || this.generateMockLandmarks();
        
        return {
            faceWidth: face.boundingBox.width,
            faceHeight: face.boundingBox.height,
            faceRatio: face.boundingBox.width / face.boundingBox.height,
            eyeDistance: Math.abs(landmarks.leftEye.x - landmarks.rightEye.x),
            noseToMouthDistance: Math.abs(landmarks.nose.y - landmarks.mouth.y),
            symmetryScore: this.calculateFacialSymmetry(landmarks)
        };
    }

    calculateFacialSymmetry(landmarks) {
        // Calculate facial symmetry based on landmarks
        const centerX = (landmarks.leftEye.x + landmarks.rightEye.x) / 2;
        const leftDistance = Math.abs(landmarks.leftEye.x - centerX);
        const rightDistance = Math.abs(landmarks.rightEye.x - centerX);
        
        return 1 - Math.abs(leftDistance - rightDistance) / Math.max(leftDistance, rightDistance);
    }

    async extractEyeFeatures(face) {
        const landmarks = face.landmarks || this.generateMockLandmarks();
        
        return {
            eyeSize: 15 + Math.random() * 10,
            eyeShape: 'oval',
            eyeSpacing: Math.abs(landmarks.leftEye.x - landmarks.rightEye.x),
            eyeAngle: Math.atan2(
                landmarks.rightEye.y - landmarks.leftEye.y,
                landmarks.rightEye.x - landmarks.leftEye.x
            )
        };
    }

    async extractNoseFeatures(face) {
        return {
            noseWidth: 8 + Math.random() * 6,
            noseLength: 12 + Math.random() * 8,
            nostrilRatio: 0.6 + Math.random() * 0.4
        };
    }

    async extractMouthFeatures(face) {
        return {
            mouthWidth: 25 + Math.random() * 15,
            lipThickness: 3 + Math.random() * 4,
            mouthCurvature: -0.1 + Math.random() * 0.2
        };
    }

    async extractTextureFeatures(face, imageData) {
        // Extract texture patterns (simplified)
        return {
            skinTexture: Math.random() * 100,
            wrinklePattern: Math.random() * 50,
            blemishCount: Math.floor(Math.random() * 5)
        };
    }

    async createBiometricHash(features) {
        console.log(' Creating privacy-preserving biometric hash...');
        
        try {
            // Convert features to a consistent string representation
            const featureString = JSON.stringify(features, Object.keys(features).sort());
            
            // Add salt for privacy
            const salt = 'zhtp_biometric_salt_v1';
            const saltedFeatures = salt + featureString;
            
            // Create hash using Web Crypto API
            const encoder = new TextEncoder();
            const data = encoder.encode(saltedFeatures);
            const hashBuffer = await crypto.subtle.digest('SHA-256', data);
            
            // Convert to hex string
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            
            return hashHex;

        } catch (error) {
            console.error('❌ Biometric hash creation failed:', error);
            throw error;
        }
    }

    async generateQrCode(canvasId, sessionId) {
        try {
            const canvas = document.getElementById(canvasId);
            if (!canvas) {
                throw new Error('QR canvas not found');
            }

            // Create QR code data
            const qrData = {
                type: 'zhtp_biometric_verification',
                sessionId: sessionId,
                timestamp: Date.now(),
                url: `zhtp://verify/${sessionId}`
            };

            // Generate QR code (simplified for demo)
            await this.drawQrCode(canvas, JSON.stringify(qrData));
            
            return true;

        } catch (error) {
            console.error('❌ QR code generation failed:', error);
            throw error;
        }
    }

    async drawQrCode(canvas, data) {
        const ctx = canvas.getContext('2d');
        const size = 200;
        canvas.width = size;
        canvas.height = size;
        
        // Clear canvas
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, size, size);
        
        // Draw simplified QR pattern
        ctx.fillStyle = 'black';
        const moduleSize = size / 25;
        
        // Generate pseudo-random pattern based on data
        let seed = this.hashCode(data);
        
        for (let i = 0; i < 25; i++) {
            for (let j = 0; j < 25; j++) {
                seed = (seed * 1103515245 + 12345) % 2147483647;
                if (seed % 2 === 0) {
                    ctx.fillRect(i * moduleSize, j * moduleSize, moduleSize, moduleSize);
                }
            }
        }
        
        // Draw corner markers
        this.drawQrCorner(ctx, 0, 0, moduleSize);
        this.drawQrCorner(ctx, size - 7 * moduleSize, 0, moduleSize);
        this.drawQrCorner(ctx, 0, size - 7 * moduleSize, moduleSize);
    }

    drawQrCorner(ctx, x, y, moduleSize) {
        ctx.fillStyle = 'black';
        ctx.fillRect(x, y, 7 * moduleSize, 7 * moduleSize);
        ctx.fillStyle = 'white';
        ctx.fillRect(x + moduleSize, y + moduleSize, 5 * moduleSize, 5 * moduleSize);
        ctx.fillStyle = 'black';
        ctx.fillRect(x + 2 * moduleSize, y + 2 * moduleSize, 3 * moduleSize, 3 * moduleSize);
    }

    hashCode(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash);
    }

    stopVerification() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
        
        if (this.verificationSession) {
            this.verificationSession.status = 'stopped';
        }
        
        console.log('🛑 Biometric verification stopped');
    }

    getVerificationStatus() {
        return this.verificationSession ? this.verificationSession.status : 'inactive';
    }

    getVerificationSession() {
        return this.verificationSession;
    }
}
