package com.enterprisepm.repository;

import com.enterprisepm.model.Notification;
import com.enterprisepm.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByRecipientOrderByCreatedAtDesc(User recipient);
    List<Notification> findByRecipientAndReadFalseOrderByCreatedAtDesc(User recipient);
    long countByRecipientAndReadFalse(User recipient);

    @Modifying
    @Query("DELETE FROM Notification n WHERE n.createdAt < :cutoff")
    void deleteOlderThan(@Param("cutoff") LocalDateTime cutoff);
}
