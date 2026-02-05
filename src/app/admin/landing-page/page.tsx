import LandingAssetsClient from './LandingAssetsClient';

export default function LandingAssetsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Landing Page Assets</h1>
                <p className="mt-2 text-sm text-gray-600">
                    Replace landing images without redeploys. Uploading updates the public URL immediately.
                </p>
            </div>
            <LandingAssetsClient />
        </div>
    );
}
