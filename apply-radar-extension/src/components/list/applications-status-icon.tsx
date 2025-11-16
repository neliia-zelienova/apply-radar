import { ApplicationStatus } from "../../types/applications";

export const ApplicationStatusIcon = ({ status }: {status?: ApplicationStatus}) => {
    const getDivWithClasses = (status?: ApplicationStatus) => {
        switch (status) {
            case ApplicationStatus.PENDING:
                return <div role='button' className="radar-no-target">
                    <div className="radar-ring"></div>
                </div> 
            case ApplicationStatus.INTERVIEW:
                return <div role='button' className="radar-weak-lock">
                    <div className="radar-ring"></div>
                </div>
            case ApplicationStatus.OFFERED:
                return <div role='button' className="radar-strong-lock">
                    <div className="radar-ring"></div> {/* ping ring */}
                </div>;
            case ApplicationStatus.REJECTED:
                return <div role='button' className="radar-lost" />
            default: return null;
        }
    }

    return getDivWithClasses(status);
}