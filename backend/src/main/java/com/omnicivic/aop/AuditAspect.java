package com.omnicivic.aop;

import com.omnicivic.service.AuditService;
import com.omnicivic.util.SecurityContextUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Aspect
@Component
@RequiredArgsConstructor
@Slf4j
public class AuditAspect {

    private final AuditService auditService;

    @Around("execution(* com.omnicivic.service.ComplaintService.submitComplaint(..)) ||" +
            "execution(* com.omnicivic.service.ComplaintService.assignComplaint(..)) ||" +
            "execution(* com.omnicivic.service.ComplaintService.updateStatus(..)) ||" +
            "execution(* com.omnicivic.service.ComplaintService.closeComplaint(..)) ||" +
            "execution(* com.omnicivic.service.CommunityService.registerCommunity(..)) ||" +
            "execution(* com.omnicivic.service.CommunityService.updateBranding(..)) ||" +
            "execution(* com.omnicivic.service.UserService.createResident(..)) ||" +
            "execution(* com.omnicivic.service.UserService.createStaff(..)) ||" +
            "execution(* com.omnicivic.service.UserService.createCoAdmin(..)) ||" +
            "execution(* com.omnicivic.service.UserService.deactivateUser(..))")
    public Object auditMethod(ProceedingJoinPoint pjp) throws Throwable {
        String methodName = pjp.getSignature().getName();
        String args = Arrays.toString(pjp.getArgs());

        String performedBy = "anonymous";
        String communityPrefix = "";

        try {
            var auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated()) {
                performedBy = auth.getName();
                try { communityPrefix = SecurityContextUtil.getCurrentCommunityPrefix(); } catch (Exception ignored) {}
            }
        } catch (Exception ignored) {}

        Object result = pjp.proceed();

        try {
            auditService.log(communityPrefix, performedBy, methodName,
                pjp.getTarget().getClass().getSimpleName(), null,
                "Args: " + args);
        } catch (Exception e) {
            log.warn("Audit log failed: {}", e.getMessage());
        }

        return result;
    }
}
