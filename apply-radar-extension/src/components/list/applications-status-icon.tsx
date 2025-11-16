import { ApplicationStatus } from "../../types/applications";

export const ApplicationStatusIcon = ({ status }: {status?: ApplicationStatus}) => {
    const getDivWithClasses = (status?: ApplicationStatus) => {
        switch (status) {
            case ApplicationStatus.PENDING:
                return <div role='button' className="radar-no-target m-auto">
                    <div className="radar-ring"></div>
                </div> 
            case ApplicationStatus.INTERVIEW:
                return <div role='button' className="radar-weak-lock m-auto">
                    <div className="radar-ring"></div>
                </div>
            case ApplicationStatus.OFFERED:
                return <div role='button' className="radar-strong-lock m-auto">
                    <div className="radar-ring"></div> {/* ping ring */}
                </div>;
            case ApplicationStatus.REJECTED:
                return <div role='button' className="radar-lost m-auto" />
            default: return null;
        }
    }

    return getDivWithClasses(status);
}