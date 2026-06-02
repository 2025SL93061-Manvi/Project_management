package com.enterprisepm.repository;

import com.enterprisepm.model.Project;
import com.enterprisepm.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findByOwner(User owner);
    List<Project> findByMembersContaining(User user);
}
