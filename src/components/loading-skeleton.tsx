import { Skeleton } from "./ui/skeleton";

function WeatherSkeleton() {
    return ( //for different sections we have different skeleton
        <div className="space-y-6">
            <div className="grid gap-6">
                <Skeleton className="h-[300px] w-full rounded-lg" />
                <Skeleton className="h-[300px] w-full rounded-lg" />
                <div className="grid grid-6 md:grid-cols-2">
                    <Skeleton className="h-[300px] w-full rounded-lg" />
                    <Skeleton className="h-[300px] w-full rounded-lg" />
                </div>
            </div>
        </div>
    );
}

export default WeatherSkeleton;