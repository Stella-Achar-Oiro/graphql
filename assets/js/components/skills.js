/**
 * Skills Component
 * Analyzes project and XP data to estimate skill proficiency levels
 */

const SkillsComponent = (() => {
    /**
     * Map project paths to skill categories
     * @type {Object}
     */
    const skillMap = {
        'go': 'Go Programming',
        'js': 'JavaScript',
        'javascript': 'JavaScript',
        'piscine-js': 'JavaScript',
        'piscine-go': 'Go Programming',
        'react': 'Frontend Development',
        'vue': 'Frontend Development',
        'angular': 'Frontend Development',
        'net': '.NET Development',
        'blockchain': 'Blockchain',
        'graphql': 'GraphQL & APIs',
        'restapi': 'REST APIs',
        'api': 'API Development',
        'ux': 'UI/UX Design',
        'ui': 'UI/UX Design',
        'forum': 'Full Stack Development',
        'social-network': 'Full Stack Development',
        'backend': 'Backend Development',
        'mongodb': 'Database Design',
        'sql': 'Database Design',
        'mysql': 'Database Design',
        'postgresql': 'Database Design',
        'docker': 'DevOps',
        'kubernetes': 'DevOps',
        'cicd': 'DevOps',
        'hack': 'Cybersecurity',
        'cipher': 'Cryptography',
        'ascii': 'Algorithms',
        'algorithms': 'Algorithms',
        'sorting': 'Algorithms',
        'game': 'Game Development',
        'ai': 'Artificial Intelligence',
        'ml': 'Machine Learning',
        'lem-in': 'Algorithms',
        'object': 'Object-Oriented Programming',
        'groupie-tracker': 'Web Development',
        'web': 'Web Development',
        'front': 'Frontend Development',
        'netpractice': 'Networking',
        'network': 'Networking'
    };
    
    /**
     * Calculate skill levels based on XP and project data
     * @param {Object} xpData - XP transaction data
     * @param {Object} projectsData - Project progress data
     * @returns {Array} Skills with levels and XP
     */
    const calculateSkills = (xpData, projectsData) => {
        const transactions = xpData.transaction || [];
        const projects = projectsData.progress || [];
        
        // Calculate skills from XP data
        const skillsXP = {};
        
        transactions.forEach(tx => {
            const pathParts = tx.path.toLowerCase().split('/');
            
            // Identify potential skill areas from the path
            const foundSkill = pathParts.find(part => skillMap[part]);
            
            if (foundSkill) {
                const skill = skillMap[foundSkill];
                
                if (!skillsXP[skill]) {
                    skillsXP[skill] = {
                        name: skill,
                        xp: 0,
                        projects: 0,
                        passed: 0
                    };
                }
                
                skillsXP[skill].xp += tx.amount;
            } else {
                // Default category for unmatched paths
                const defaultSkill = 'General Programming';
                if (!skillsXP[defaultSkill]) {
                    skillsXP[defaultSkill] = {
                        name: defaultSkill,
                        xp: 0,
                        projects: 0,
                        passed: 0
                    };
                }
                skillsXP[defaultSkill].xp += tx.amount;
            }
        });
        
        // Add project counts to skills
        projects.forEach(project => {
            const pathParts = project.path.toLowerCase().split('/');
            const foundSkill = pathParts.find(part => skillMap[part]);
            
            if (foundSkill) {
                const skill = skillMap[foundSkill];
                
                if (skillsXP[skill]) {
                    skillsXP[skill].projects++;
                    if (project.grade > 0) {
                        skillsXP[skill].passed++;
                    }
                }
            }
        });
        
        // Calculate total XP for percentage calculations
        const totalXP = Object.values(skillsXP).reduce((sum, skill) => sum + skill.xp, 0);
        
        // Calculate levels and percentages
        const skills = Object.values(skillsXP).map(skill => {
            const percentage = (skill.xp / totalXP * 100).toFixed(1);
            const passRate = skill.projects > 0 ? (skill.passed / skill.projects * 100).toFixed(1) : 0;
            let level;
            
            // Determine skill level based on percentage of total XP and pass rate
            if (percentage > 15 || (skill.projects > 10 && passRate > 80)) {
                level = 'expert';
            } else if (percentage > 10 || (skill.projects > 5 && passRate > 70)) {
                level = 'advanced';
            } else if (percentage > 5 || (skill.projects > 3 && passRate > 50)) {
                level = 'intermediate';
            } else {
                level = 'beginner';
            }
            
            return {
                ...skill,
                percentage,
                passRate,
                level
            };
        });
        
        // Sort by XP (highest first)
        return skills.sort((a, b) => b.xp - a.xp);
    };
    
    /**
     * Render the skills section
     * @param {Object} xpData - XP data from API
     * @param {Object} projectsData - Project progress data 
     * @returns {string} HTML content for the skills section
     */
    const render = (xpData, projectsData) => {
        if (!xpData || !xpData.transaction || !projectsData || !projectsData.progress) {
            return '<div class="error-message">Insufficient data to analyze skills</div>';
        }
        
        // Calculate skill levels
        const skills = calculateSkills(xpData, projectsData);
        
        // Calculate total XP
        const totalXP = xpData.transaction.reduce((sum, tx) => sum + tx.amount, 0);
        
        // Build skills overview
        const expertSkills = skills.filter(skill => skill.level === 'expert');
        const advancedSkills = skills.filter(skill => skill.level === 'advanced');
        
        // Build the complete skills section HTML
        return `
            <div class="skills-container">
                <div class="skills-overview">
                    <div class="skills-overview-header">
                        <h2 class="skills-title">Skill Assessment</h2>
                        <p class="skills-subtitle">Based on ${Helpers.formatXpAsFileSize(totalXP)} across ${projectsData.progress.length} projects</p>
                    </div>
                    
                    <div class="skills-summary">
                        <div class="skill-level-count">
                            <div class="level-count expert">${expertSkills.length}</div>
                            <div class="level-label">Expert</div>
                        </div>
                        <div class="skill-level-count">
                            <div class="level-count advanced">${advancedSkills.length}</div>
                            <div class="level-label">Advanced</div>
                        </div>
                        <div class="skill-level-count">
                            <div class="level-count intermediate">${skills.filter(s => s.level === 'intermediate').length}</div>
                            <div class="level-label">Intermediate</div>
                        </div>
                        <div class="skill-level-count">
                            <div class="level-count beginner">${skills.filter(s => s.level === 'beginner').length}</div>
                            <div class="level-label">Beginner</div>
                        </div>
                    </div>
                </div>
                
                <div class="skills-grid">
                    ${skills.map(skill => `
                        <div class="skill-card">
                            <div class="skill-header">
                                <div class="skill-name">${skill.name}</div>
                                <div class="skill-level ${skill.level}">${skill.level}</div>
                            </div>
                            <div class="skill-bar">
                                <div class="skill-progress ${skill.level}" style="width: ${Math.min(100, Math.max(5, parseFloat(skill.percentage)))}%"></div>
                            </div>
                            <div class="skill-stats">
                                <div>${Helpers.formatXpAsFileSize(skill.xp)}</div>
                                <div>${skill.percentage}% of total</div>
                            </div>
                            ${skill.projects > 0 ? `
                                <div class="skill-projects">
                                    <div class="projects-completed">${skill.passed} / ${skill.projects} projects</div>
                                    <div class="projects-rate">${skill.passRate}% completion</div>
                                </div>
                            ` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    };
    
    // Public API
    return {
        render
    };
})();