import { ApplicationStatus } from "../../types/applications";

export const ApplicationStatusIcon = ({ status, onClick }: {status?: ApplicationStatus, onClick?: () => void}) => {
    const getDivWithClasses = (status?: ApplicationStatus) => {
        switch (status) {
            case ApplicationStatus.PENDING:
                return <button className="radar-no-target m-auto" onClick={onClick}>
                    <div className="radar-ring"></div>
                </button>;
            case ApplicationStatus.INTERVIEW:
                return <button role='button' className="radar-weak-lock m-auto" onClick={onClick}>
                    <div className="radar-ring"></div>
                </button>
            case ApplicationStatus.OFFERED:
                return <button role='button' className="radar-strong-lock m-auto" onClick={onClick}>
                    <div className="radar-ring"></div> {/* ping ring */}
                </button>;
            case ApplicationStatus.REJECTED:
                return <button role='button' className="radar-lost m-auto" onClick={onClick} />;
            default: return null;
        }
    }

    return getDivWithClasses(status);
}