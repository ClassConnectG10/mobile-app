import React, { createContext, useState, useContext, ReactNode } from "react";
import Course from "@/types/course";

interface CourseContext {
    course: Course | null;
    setCourse: (info: Course | null) => void;
    deleteCourse: () => void;
}

const courseContext = createContext<CourseContext | null>(null);

export const CourseProvider: React.FC<{ children: ReactNode }> = ({
    children,
}) => {
    const [course, setCourse] = useState<Course | null>(null);

    const deleteCourse = () => {
        setCourse(null);
    };

    return (
        <courseContext.Provider value={{ course, setCourse, deleteCourse }}>
            {children}
        </courseContext.Provider>
    );
};

export const useCourseContext = (): CourseContext => {
    const context = useContext(courseContext);
    if (!context) {
        throw new Error("useCourseContext must be used within a CourseProvider");
    }
    return context;
};
