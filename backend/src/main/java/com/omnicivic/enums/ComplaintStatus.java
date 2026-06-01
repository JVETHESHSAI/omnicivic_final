package com.omnicivic.enums;

public enum ComplaintStatus {
    SUBMITTED,
    OPEN,
    ASSIGNED,
    IN_PROGRESS,
    PROOF_SUBMITTED,   // Staff uploaded proof, awaiting admin verification
    RESOLVED,          // Admin verified proof as accepted
    CLOSED             // Admin closed with resolution note
}
