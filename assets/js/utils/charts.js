/**
 * Chart Utilities
 * SVG chart generation for statistics visualization
 */

const ChartUtils = (() => {
    // Create and manage tooltips
    const tooltip = (() => {
        let tooltipEl = null;
        
        const init = () => {
            if (!tooltipEl) {
                tooltipEl = document.createElement('div');
                tooltipEl.className = 'chart-tooltip';
                tooltipEl.style.opacity = 0;
                document.body.appendChild(tooltipEl);
            }
            return tooltipEl;
        };
        
        const show = (content, x, y) => {
            const el = init();
            el.innerHTML = content;
            el.style.left = `${x + 10}px`;
            el.style.top = `${y + 10}px`;
            el.style.opacity = 1;
        };
        
        const hide = () => {
            const el = init();
            el.style.opacity = 0;
        };
        
        return { show, hide };
    })();
    
    /**
     * Helper to create an SVG element with namespace
     * @param {string} tag - SVG tag name
     * @returns {SVGElement} The created SVG element
     */
    const createSVGElement = (tag) => {
        return document.createElementNS('http://www.w3.org/2000/svg', tag);
    };
    
    /**
     * Get theme-aware colors for charts
     * @returns {Object} Color set based on current theme
     */
    const getThemeColors = () => {
        const isDarkTheme = document.body.classList.contains('dark-theme');
        
        return {
            text: isDarkTheme ? '#a0a0a0' : '#666666',
            axis: isDarkTheme ? '#555555' : '#cccccc',
            primary: isDarkTheme ? '#64b5f6' : '#3498db',
            secondary: isDarkTheme ? '#ba68c8' : '#9b59b6',
            success: isDarkTheme ? '#81c784' : '#2ecc71',
            danger: isDarkTheme ? '#e57373' : '#e74c3c',
            warning: isDarkTheme ? '#ffb74d' : '#f39c12',
            background: isDarkTheme ? '#1e1e1e' : '#ffffff',
        };
    };
    
    /**
     * Create a bar chart showing XP per project
     * @param {Array} data - XP transaction data
     * @param {string} svgId - ID of the SVG element
     */
    const createXpBarChart = (data, svgId) => {
        // Get the SVG element
        const svg = document.getElementById(svgId);
        if (!svg) return;
        
        // Clear any existing content
        svg.innerHTML = '';
        
        // If there's no data, show a message
        if (!data || data.length === 0) {
            const noData = createSVGElement('text');
            noData.setAttribute('x', svg.clientWidth / 2);
            noData.setAttribute('y', svg.clientHeight / 2);
            noData.setAttribute('text-anchor', 'middle');
            noData.setAttribute('fill', getThemeColors().text);
            noData.textContent = 'No XP data available';
            svg.appendChild(noData);
            return;
        }
        
        // Set dimensions
        const width = svg.clientWidth || 500;
        const height = svg.clientHeight || 300;
        const margin = { top: 40, right: 30, bottom: 60, left: 60 };
        const chartWidth = width - margin.left - margin.right;
        const chartHeight = height - margin.top - margin.bottom;
        
        // Get theme colors
        const colors = getThemeColors();
        
        // Group projects and sum XP - ensure numeric values
        const projectXp = data.reduce((acc, item) => {
            const pathParts = item.path.split('/');
            const projectName = pathParts[pathParts.length - 1];
            
            if (!acc[projectName]) {
                acc[projectName] = 0;
            }
            acc[projectName] += Number(item.amount) || 0;
            return acc;
        }, {});
        
        // Convert to array for easier processing
        const projectData = Object.entries(projectXp)
            .map(([name, xp]) => ({ name, xp }))
            .sort((a, b) => b.xp - a.xp)
            .slice(0, 10); // Limit to top 10
        
        // If after processing we have no projects, show message
        if (projectData.length === 0) {
            const noData = createSVGElement('text');
            noData.setAttribute('x', width / 2);
            noData.setAttribute('y', height / 2);
            noData.setAttribute('text-anchor', 'middle');
            noData.setAttribute('fill', colors.text);
            noData.textContent = 'No project XP data available';
            svg.appendChild(noData);
            return;
        }
        
        // Create scaling functions
        const xScale = index => margin.left + (index * (chartWidth / projectData.length)) + (chartWidth / projectData.length / 2);
        const yScale = value => margin.top + chartHeight - (value / Math.max(...projectData.map(p => p.xp)) * chartHeight);
        
        // Create group for chart
        const chartGroup = createSVGElement('g');
        svg.appendChild(chartGroup);
        
        // Create bars
        projectData.forEach((project, index) => {
            const barWidth = chartWidth / projectData.length * 0.7;
            const barHeight = (project.xp / Math.max(...projectData.map(p => p.xp))) * chartHeight;
            const x = xScale(index) - barWidth / 2;
            const y = margin.top + chartHeight - barHeight;
            
            // Bar
            const bar = createSVGElement('rect');
            bar.setAttribute('x', x);
            bar.setAttribute('y', y);
            bar.setAttribute('width', barWidth);
            bar.setAttribute('height', barHeight);
            bar.setAttribute('fill', colors.primary);
            bar.setAttribute('class', 'chart-bar');
            
            // Tooltip events
            bar.addEventListener('mousemove', (e) => {
                tooltip.show(`
                    <strong>${project.name}</strong><br>
                    XP: ${Helpers.formatXpAsFileSize(project.xp)}
                `, e.clientX, e.clientY);
            });
            bar.addEventListener('mouseout', tooltip.hide);
            
            chartGroup.appendChild(bar);
            
            // Label
            const label = createSVGElement('text');
            label.setAttribute('x', xScale(index));
            label.setAttribute('y', height - margin.bottom / 2);
            label.setAttribute('text-anchor', 'middle');
            label.setAttribute('font-size', '12px');
            label.setAttribute('fill', colors.text);
            label.textContent = project.name.length > 8 ? project.name.substring(0, 8) + '...' : project.name;
            
            // Rotate label if name is long
            if (project.name.length > 6) {
                label.setAttribute('transform', `rotate(-45, ${xScale(index)}, ${height - margin.bottom / 2})`);
            }
            
            chartGroup.appendChild(label);
        });
        
        // Add axes
        // Y-axis
        const yAxis = createSVGElement('line');
        yAxis.setAttribute('x1', margin.left);
        yAxis.setAttribute('y1', margin.top);
        yAxis.setAttribute('x2', margin.left);
        yAxis.setAttribute('y2', margin.top + chartHeight);
        yAxis.setAttribute('stroke', colors.axis);
        yAxis.setAttribute('stroke-width', '1');
        chartGroup.appendChild(yAxis);
        
        // X-axis
        const xAxis = createSVGElement('line');
        xAxis.setAttribute('x1', margin.left);
        xAxis.setAttribute('y1', margin.top + chartHeight);
        xAxis.setAttribute('x2', margin.left + chartWidth);
        xAxis.setAttribute('y2', margin.top + chartHeight);
        xAxis.setAttribute('stroke', colors.axis);
        xAxis.setAttribute('stroke-width', '1');
        chartGroup.appendChild(xAxis);
        
        // Add y-axis label
        const yLabel = createSVGElement('text');
        yLabel.setAttribute('x', 20);
        yLabel.setAttribute('y', margin.top + chartHeight / 2);
        yLabel.setAttribute('text-anchor', 'middle');
        yLabel.setAttribute('transform', `rotate(-90, 20, ${margin.top + chartHeight / 2})`);
        yLabel.setAttribute('fill', colors.text);
        yLabel.textContent = 'XP Amount';
        chartGroup.appendChild(yLabel);
        
        // Add title
        const title = createSVGElement('text');
        title.setAttribute('x', width / 2);
        title.setAttribute('y', margin.top / 2);
        title.setAttribute('text-anchor', 'middle');
        title.setAttribute('font-size', '16px');
        title.setAttribute('font-weight', 'bold');
        title.setAttribute('fill', colors.text);
        title.textContent = 'XP per Project';
        chartGroup.appendChild(title);
    };
    
    /**
     * Create a pie chart showing pass/fail ratio
     * @param {Array} data - Project progress data
     * @param {string} svgId - ID of the SVG element
     */
    const createPassFailPieChart = (data, svgId) => {
        // Get the SVG element
        const svg = document.getElementById(svgId);
        if (!svg) return;
        
        // Clear any existing content
        svg.innerHTML = '';
        
        // Set dimensions
        const width = svg.clientWidth || 500;
        const height = svg.clientHeight || 300;
        const margin = 40;
        const radius = Math.min(width, height) / 2 - margin;
        
        // Get theme colors
        const colors = getThemeColors();
        
        // Count pass/fail projects
        const passCount = data.filter(item => item.grade > 0).length;
        const failCount = data.filter(item => item.grade === 0).length;
        
        // Skip if no data
        if (passCount + failCount === 0) {
            const noData = createSVGElement('text');
            noData.setAttribute('x', width / 2);
            noData.setAttribute('y', height / 2);
            noData.setAttribute('text-anchor', 'middle');
            noData.setAttribute('fill', colors.text);
            noData.textContent = 'No project data available';
            svg.appendChild(noData);
            return;
        }
        
        const total = passCount + failCount;
        const passRatio = passCount / total;
        const failRatio = failCount / total;
        
        // Create group for chart and center it
        const chartGroup = createSVGElement('g');
        chartGroup.setAttribute('transform', `translate(${width / 2}, ${height / 2})`);
        svg.appendChild(chartGroup);
        
        // Helper to create a pie segment
        const createPieSegment = (startAngle, endAngle, fill, label, value) => {
            // Calculate points
            const x1 = radius * Math.cos(startAngle);
            const y1 = radius * Math.sin(startAngle);
            const x2 = radius * Math.cos(endAngle);
            const y2 = radius * Math.sin(endAngle);
            
            // Determine if arc is more than 180 degrees
            const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0;
            
            // Create path
            const path = createSVGElement('path');
            path.setAttribute('d', `M 0 0 L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`);
            path.setAttribute('fill', fill);
            path.setAttribute('class', 'chart-pie-segment');
            
            // Add tooltip events
            path.addEventListener('mousemove', (e) => {
                const percent = Math.round(value * 100);
                tooltip.show(`
                    <strong>${label}</strong><br>
                    ${percent}% (${label === 'Passed' ? passCount : failCount} projects)
                `, e.clientX, e.clientY);
            });
            path.addEventListener('mouseout', tooltip.hide);
            
            return path;
        };
        
        // Create segments
        const startAngle = 0;
        const passEndAngle = startAngle + (passRatio * Math.PI * 2);
        const failEndAngle = Math.PI * 2;
        
        // Add pass segment if there are passes
        if (passCount > 0) {
            const passSegment = createPieSegment(startAngle, passEndAngle, colors.success, 'Passed', passRatio);
            chartGroup.appendChild(passSegment);
        }
        
        // Add fail segment if there are fails
        if (failCount > 0) {
            const failSegment = createPieSegment(passEndAngle, failEndAngle, colors.danger, 'Failed', failRatio);
            chartGroup.appendChild(failSegment);
        }
        
        // Add legend
        const legendGroup = createSVGElement('g');
        legendGroup.setAttribute('transform', `translate(${-radius}, ${radius + 20})`);
        chartGroup.appendChild(legendGroup);
        
        // Pass legend item
        const passRect = createSVGElement('rect');
        passRect.setAttribute('x', 0);
        passRect.setAttribute('y', 0);
        passRect.setAttribute('width', 15);
        passRect.setAttribute('height', 15);
        passRect.setAttribute('fill', colors.success);
        legendGroup.appendChild(passRect);
        
        const passText = createSVGElement('text');
        passText.setAttribute('x', 25);
        passText.setAttribute('y', 12);
        passText.setAttribute('fill', colors.text);
        passText.textContent = `Passed (${passCount})`;
        legendGroup.appendChild(passText);
        
        // Fail legend item
        const failRect = createSVGElement('rect');
        failRect.setAttribute('x', 0);
        failRect.setAttribute('y', 25);
        failRect.setAttribute('width', 15);
        failRect.setAttribute('height', 15);
        failRect.setAttribute('fill', colors.danger);
        legendGroup.appendChild(failRect);
        
        const failText = createSVGElement('text');
        failText.setAttribute('x', 25);
        failText.setAttribute('y', 37);
        failText.setAttribute('fill', colors.text);
        failText.textContent = `Failed (${failCount})`;
        legendGroup.appendChild(failText);
        
        // Add title
        const title = createSVGElement('text');
        title.setAttribute('x', 0);
        title.setAttribute('y', -radius - 10);
        title.setAttribute('text-anchor', 'middle');
        title.setAttribute('font-weight', 'bold');
        title.setAttribute('fill', colors.text);
        title.textContent = 'Project Pass/Fail Ratio';
        chartGroup.appendChild(title);
    };
    
    /**
     * Create a line chart showing XP accumulation over time
     * @param {Array} data - XP transaction data
     * @param {string} svgId - ID of the SVG element
     */
    const createXpTimelineChart = (data, svgId) => {
        // Get the SVG element
        const svg = document.getElementById(svgId);
        if (!svg) return;
        
        // Clear any existing content
        svg.innerHTML = '';
        
        // If there's no data, show a message
        if (!data || data.length === 0) {
            const noData = createSVGElement('text');
            noData.setAttribute('x', svg.clientWidth / 2);
            noData.setAttribute('y', svg.clientHeight / 2);
            noData.setAttribute('text-anchor', 'middle');
            noData.setAttribute('fill', getThemeColors().text);
            noData.textContent = 'No XP timeline data available';
            svg.appendChild(noData);
            return;
        }
        
        // Set dimensions
        const width = svg.clientWidth || 500;
        const height = svg.clientHeight || 300;
        const margin = { top: 40, right: 30, bottom: 50, left: 60 };
        const chartWidth = width - margin.left - margin.right;
        const chartHeight = height - margin.top - margin.bottom;
        
        // Get theme colors
        const colors = getThemeColors();
        
        // Sort data by date
        const sortedData = [...data].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        
        // Group data by month
        const monthlyData = sortedData.reduce((acc, item) => {
            const date = new Date(item.createdAt);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            
            if (!acc[monthKey]) {
                acc[monthKey] = {
                    month: monthKey,
                    date: new Date(date.getFullYear(), date.getMonth(), 1),
                    xp: 0
                };
            }
            acc[monthKey].xp += item.amount;
            return acc;
        }, {});
        
        // Convert to array and calculate cumulative XP
        const timelineData = Object.values(monthlyData)
            .sort((a, b) => a.date - b.date);
        
        // Calculate cumulative XP
        let cumulativeXp = 0;
        const cumulativeData = timelineData.map(item => {
            cumulativeXp += item.xp;
            return {
                ...item,
                cumulativeXp
            };
        });
        
        // Skip if no data
        if (cumulativeData.length < 2) {
            const noData = createSVGElement('text');
            noData.setAttribute('x', width / 2);
            noData.setAttribute('y', height / 2);
            noData.setAttribute('text-anchor', 'middle');
            noData.setAttribute('fill', colors.text);
            noData.textContent = 'Insufficient data for timeline';
            svg.appendChild(noData);
            return;
        }
        
        // Create scaling functions
        const xScale = date => {
            const minDate = cumulativeData[0].date;
            const maxDate = cumulativeData[cumulativeData.length - 1].date;
            const totalDays = (maxDate - minDate) / (1000 * 60 * 60 * 24);
            const daysDiff = (date - minDate) / (1000 * 60 * 60 * 24);
            return margin.left + (daysDiff / totalDays) * chartWidth;
        };
        
        const yScale = value => {
            const maxXp = cumulativeData[cumulativeData.length - 1].cumulativeXp;
            return margin.top + chartHeight - (value / maxXp) * chartHeight;
        };
        
        // Create group for chart
        const chartGroup = createSVGElement('g');
        svg.appendChild(chartGroup);
        
        // Create line path
        let pathD = `M ${xScale(cumulativeData[0].date)} ${yScale(cumulativeData[0].cumulativeXp)}`;
        cumulativeData.slice(1).forEach(point => {
            pathD += ` L ${xScale(point.date)} ${yScale(point.cumulativeXp)}`;
        });
        
        const linePath = createSVGElement('path');
        linePath.setAttribute('d', pathD);
        linePath.setAttribute('stroke', colors.primary);
        linePath.setAttribute('stroke-width', '2');
        linePath.setAttribute('fill', 'none');
        linePath.setAttribute('class', 'chart-line');
        chartGroup.appendChild(linePath);
        
        // Create area path (filled area under the line)
        let areaD = pathD;
        areaD += ` L ${xScale(cumulativeData[cumulativeData.length - 1].date)} ${yScale(0)}`;
        areaD += ` L ${xScale(cumulativeData[0].date)} ${yScale(0)} Z`;
        
        const areaPath = createSVGElement('path');
        areaPath.setAttribute('d', areaD);
        areaPath.setAttribute('fill', colors.primary);
        areaPath.setAttribute('fill-opacity', '0.1');
        areaPath.setAttribute('class', 'chart-area');
        chartGroup.appendChild(areaPath);
        
        // Add data points with tooltips
        cumulativeData.forEach((point, i) => {
            // Only show every n-th point if there are many
            if (cumulativeData.length > 12 && i % Math.ceil(cumulativeData.length / 12) !== 0) return;
            
            const circle = createSVGElement('circle');
            circle.setAttribute('cx', xScale(point.date));
            circle.setAttribute('cy', yScale(point.cumulativeXp));
            circle.setAttribute('r', '4');
            circle.setAttribute('fill', colors.primary);
            
            // Tooltip events
            circle.addEventListener('mousemove', (e) => {
                const date = point.date.toLocaleDateString(undefined, { year: 'numeric', month: 'short' });
                tooltip.show(`
                    <strong>${date}</strong><br>
                    Total XP: ${Helpers.formatXpAsFileSize(point.cumulativeXp)}<br>
                    Monthly XP: ${Helpers.formatXpAsFileSize(point.xp)}
                `, e.clientX, e.clientY);
            });
            circle.addEventListener('mouseout', tooltip.hide);
            
            chartGroup.appendChild(circle);
        });
        
        // Add x-axis
        const xAxis = createSVGElement('line');
        xAxis.setAttribute('x1', margin.left);
        xAxis.setAttribute('y1', margin.top + chartHeight);
        xAxis.setAttribute('x2', margin.left + chartWidth);
        xAxis.setAttribute('y2', margin.top + chartHeight);
        xAxis.setAttribute('stroke', colors.axis);
        xAxis.setAttribute('stroke-width', '1');
        chartGroup.appendChild(xAxis);
        
        // Add x-axis labels
        // Show only a selection of dates to avoid overcrowding
        const dateLabels = [];
        if (cumulativeData.length <= 6) {
            // If few data points, show all
            dateLabels.push(...cumulativeData);
        } else {
            // Show first, last and some in between
            dateLabels.push(cumulativeData[0]);
            
            // Add some middle points
            const step = Math.ceil(cumulativeData.length / 4);
            for (let i = step; i < cumulativeData.length - step; i += step) {
                dateLabels.push(cumulativeData[i]);
            }
            
            dateLabels.push(cumulativeData[cumulativeData.length - 1]);
        }
        
        dateLabels.forEach(point => {
            const label = createSVGElement('text');
            label.setAttribute('x', xScale(point.date));
            label.setAttribute('y', margin.top + chartHeight + 20);
            label.setAttribute('text-anchor', 'middle');
            label.setAttribute('font-size', '12px');
            label.setAttribute('fill', colors.text);
            
            // Format date as Month Year
            const date = point.date.toLocaleDateString(undefined, { month: 'short', year: '2-digit' });
            label.textContent = date;
            
            chartGroup.appendChild(label);
        });
        
        // Add y-axis
        const yAxis = createSVGElement('line');
        yAxis.setAttribute('x1', margin.left);
        yAxis.setAttribute('y1', margin.top);
        yAxis.setAttribute('x2', margin.left);
        yAxis.setAttribute('y2', margin.top + chartHeight);
        yAxis.setAttribute('stroke', colors.axis);
        yAxis.setAttribute('stroke-width', '1');
        chartGroup.appendChild(yAxis);
        
        // Add y-axis labels
        const maxXp = cumulativeData[cumulativeData.length - 1].cumulativeXp;
        const yLabels = [0, maxXp * 0.25, maxXp * 0.5, maxXp * 0.75, maxXp];
        
        yLabels.forEach(value => {
            const label = createSVGElement('text');
            label.setAttribute('x', margin.left - 10);
            label.setAttribute('y', yScale(value));
            label.setAttribute('text-anchor', 'end');
            label.setAttribute('dominant-baseline', 'middle');
            label.setAttribute('font-size', '12px');
            label.setAttribute('fill', colors.text);
            label.textContent = Helpers.formatXpAsFileSize(value);
            
            chartGroup.appendChild(label);
            
            // Add a subtle grid line
            const gridLine = createSVGElement('line');
            gridLine.setAttribute('x1', margin.left);
            gridLine.setAttribute('y1', yScale(value));
            gridLine.setAttribute('x2', margin.left + chartWidth);
            gridLine.setAttribute('y2', yScale(value));
            gridLine.setAttribute('stroke', colors.axis);
            gridLine.setAttribute('stroke-width', '0.5');
            gridLine.setAttribute('stroke-dasharray', '3,3');
            chartGroup.appendChild(gridLine);
        });
        
        // Add title
        const title = createSVGElement('text');
        title.setAttribute('x', width / 2);
        title.setAttribute('y', margin.top / 2);
        title.setAttribute('text-anchor', 'middle');
        title.setAttribute('font-size', '16px');
        title.setAttribute('font-weight', 'bold');
        title.setAttribute('fill', colors.text);
        title.textContent = 'XP Growth Over Time';
        chartGroup.appendChild(title);
    };
    
    /**
     * Create a chart showing audit performance
     * @param {Object} data - Audit transaction data with up and down
     * @param {string} svgId - ID of the SVG element
     */
    const createAuditChart = (data, svgId) => {
        // Get the SVG element
        const svg = document.getElementById(svgId);
        if (!svg) return;
        
        // Clear any existing content
        svg.innerHTML = '';
        
        // Set dimensions
        const width = svg.clientWidth || 500;
        const height = svg.clientHeight || 300;
        const margin = { top: 40, right: 30, bottom: 70, left: 60 };
        const chartWidth = width - margin.left - margin.right;
        const chartHeight = height - margin.top - margin.bottom;
        
        // Get theme colors
        const colors = getThemeColors();
        
        // Extract data
        const received = data.up || [];
        const given = data.down || [];
        
        // Calculate totals
        const totalReceived = received.reduce((sum, tx) => sum + tx.amount, 0);
        const totalGiven = given.reduce((sum, tx) => sum + tx.amount, 0);
        
        // Create group for chart
        const chartGroup = createSVGElement('g');
        svg.appendChild(chartGroup);
        
        // Skip if no data
        if (received.length === 0 && given.length === 0) {
            const noData = createSVGElement('text');
            noData.setAttribute('x', width / 2);
            noData.setAttribute('y', height / 2);
            noData.setAttribute('text-anchor', 'middle');
            noData.setAttribute('fill', colors.text);
            noData.textContent = 'No audit data available';
            chartGroup.appendChild(noData);
            return;
        }
        
        // Create bars for received and given audits
        const barWidth = chartWidth / 3;
        
        // Calculate max value for scaling
        const maxValue = Math.max(totalReceived, totalGiven);
        
        // Helper function to create bars
        const createBar = (value, x, color, label) => {
            const barHeight = (value / maxValue) * chartHeight;
            const y = margin.top + chartHeight - barHeight;
            
            // Bar
            const bar = createSVGElement('rect');
            bar.setAttribute('x', x);
            bar.setAttribute('y', y);
            bar.setAttribute('width', barWidth);
            bar.setAttribute('height', barHeight);
            bar.setAttribute('fill', color);
            
            // Tooltip events
            bar.addEventListener('mousemove', (e) => {
                tooltip.show(`
                    <strong>${label}</strong><br>
                    ${value.toLocaleString()} points
                `, e.clientX, e.clientY);
            });
            bar.addEventListener('mouseout', tooltip.hide);
            
            chartGroup.appendChild(bar);
            
            // Value label on top of bar
            const valueLabel = createSVGElement('text');
            valueLabel.setAttribute('x', x + barWidth / 2);
            valueLabel.setAttribute('y', y - 10);
            valueLabel.setAttribute('text-anchor', 'middle');
            valueLabel.setAttribute('font-size', '14px');
            valueLabel.setAttribute('fill', colors.text);
            valueLabel.textContent = value.toLocaleString();
            chartGroup.appendChild(valueLabel);
            
            // Category label below bar
            const catLabel = createSVGElement('text');
            catLabel.setAttribute('x', x + barWidth / 2);
            catLabel.setAttribute('y', margin.top + chartHeight + 20);
            catLabel.setAttribute('text-anchor', 'middle');
            catLabel.setAttribute('font-size', '14px');
            catLabel.setAttribute('fill', colors.text);
            catLabel.textContent = label;
            chartGroup.appendChild(catLabel);
        };
        
        // Create the bars
        const receivedX = margin.left + chartWidth / 4 - barWidth / 2;
        const givenX = margin.left + chartWidth * 3/4 - barWidth / 2;
        
        createBar(totalReceived, receivedX, colors.success, 'Received');
        createBar(totalGiven, givenX, colors.danger, 'Given');
        
        // Add ratio display
        const ratio = totalGiven > 0 ? (totalReceived / totalGiven).toFixed(2) : 'N/A';
        
        const ratioLabel = createSVGElement('text');
        ratioLabel.setAttribute('x', width / 2);
        ratioLabel.setAttribute('y', margin.top / 2);
        ratioLabel.setAttribute('text-anchor', 'middle');
        ratioLabel.setAttribute('font-size', '16px');
        ratioLabel.setAttribute('font-weight', 'bold');
        ratioLabel.setAttribute('fill', colors.text);
        ratioLabel.textContent = `Audit Ratio: ${ratio}`;
        chartGroup.appendChild(ratioLabel);
        
        // Add horizontal axis
        const xAxis = createSVGElement('line');
        xAxis.setAttribute('x1', margin.left);
        xAxis.setAttribute('y1', margin.top + chartHeight);
        xAxis.setAttribute('x2', margin.left + chartWidth);
        xAxis.setAttribute('y2', margin.top + chartHeight);
        xAxis.setAttribute('stroke', colors.axis);
        xAxis.setAttribute('stroke-width', '1');
        chartGroup.appendChild(xAxis);
    };
    
    /**
     * Create a time-based audit history chart
     * @param {Object} data - Audit transaction data with up and down arrays
     * @param {string} svgId - ID of the SVG element
     */
    const createAuditHistoryChart = (data, svgId) => {
        // Get the SVG element
        const svg = document.getElementById(svgId);
        if (!svg) return;
        
        // Clear any existing content
        svg.innerHTML = '';
        
        // Set dimensions
        const width = svg.clientWidth || 500;
        const height = svg.clientHeight || 350;
        const margin = { top: 30, right: 30, bottom: 40, left: 50 };
        const chartWidth = width - margin.left - margin.right;
        const chartHeight = height - margin.top - margin.bottom;
        
        // Get theme colors
        const colors = getThemeColors();
        
        // Extract data
        const received = data.up || [];
        const given = data.down || [];
        
        // Skip if no data
        if (received.length === 0 && given.length === 0) {
            const noData = createSVGElement('text');
            noData.setAttribute('x', width / 2);
            noData.setAttribute('y', height / 2);
            noData.setAttribute('text-anchor', 'middle');
            noData.setAttribute('fill', colors.text);
            noData.textContent = 'No audit data available';
            svg.appendChild(noData);
            return;
        }
        
        // Combine all audits to find date range
        const allAudits = [...received, ...given].sort((a, b) => 
            new Date(a.createdAt) - new Date(b.createdAt)
        );
        
        // Group audits by month
        const groupAuditsByMonth = (audits) => {
            return audits.reduce((acc, audit) => {
                const date = new Date(audit.createdAt);
                const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                
                if (!acc[monthYear]) {
                    acc[monthYear] = {
                        month: monthYear,
                        date: new Date(date.getFullYear(), date.getMonth(), 1),
                        count: 0,
                        points: 0
                    };
                }
                
                acc[monthYear].count++;
                acc[monthYear].points += audit.amount;
                
                return acc;
            }, {});
        };
        
        const receivedByMonth = groupAuditsByMonth(received);
        const givenByMonth = groupAuditsByMonth(given);
        
        // Create an array of all months in the range
        const startDate = new Date(allAudits[0].createdAt);
        const endDate = new Date(allAudits[allAudits.length - 1].createdAt);
        
        const months = [];
        let currentDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
        
        while (currentDate <= endDate) {
            const monthYear = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
            months.push(monthYear);
            currentDate.setMonth(currentDate.getMonth() + 1);
        }
        
        // Create data points for all months
        const chartData = months.map(monthYear => {
            const receivedData = receivedByMonth[monthYear] || { count: 0, points: 0 };
            const givenData = givenByMonth[monthYear] || { count: 0, points: 0 };
            
            return {
                month: monthYear,
                date: new Date(monthYear.split('-')[0], Number(monthYear.split('-')[1]) - 1, 1),
                receivedCount: receivedData.count,
                receivedPoints: receivedData.points,
                givenCount: givenData.count,
                givenPoints: givenData.points,
            };
        });
        
        // Create group for chart
        const chartGroup = createSVGElement('g');
        chartGroup.setAttribute('transform', `translate(${margin.left}, ${margin.top})`);
        svg.appendChild(chartGroup);
        
        // Create scales
        const xScale = (date) => {
            const firstDate = chartData[0].date;
            const lastDate = chartData[chartData.length - 1].date;
            const totalDays = (lastDate - firstDate) / (1000 * 60 * 60 * 24);
            const daysDiff = (date - firstDate) / (1000 * 60 * 60 * 24);
            return (daysDiff / totalDays) * chartWidth;
        };
        
        // Find max count value
        const maxCount = Math.max(
            ...chartData.map(d => Math.max(d.receivedCount, d.givenCount))
        );
        
        const yScale = (value) => {
            return chartHeight - (value / maxCount) * chartHeight;
        };
        
        // Create line generators
        const createLinePath = (data, accessor) => {
            let pathD = '';
            
            data.forEach((d, i) => {
                const x = xScale(d.date);
                const y = yScale(accessor(d));
                pathD += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
            });
            
            return pathD;
        };
        
        // Create received line
        const receivedPath = createSVGElement('path');
        receivedPath.setAttribute('d', createLinePath(chartData, d => d.receivedCount));
        receivedPath.setAttribute('stroke', colors.success);
        receivedPath.setAttribute('stroke-width', '2');
        receivedPath.setAttribute('fill', 'none');
        receivedPath.setAttribute('class', 'chart-line');
        chartGroup.appendChild(receivedPath);
        
        // Create given line
        const givenPath = createSVGElement('path');
        givenPath.setAttribute('d', createLinePath(chartData, d => d.givenCount));
        givenPath.setAttribute('stroke', colors.danger);
        givenPath.setAttribute('stroke-width', '2');
        givenPath.setAttribute('fill', 'none');
        givenPath.setAttribute('class', 'chart-line');
        chartGroup.appendChild(givenPath);
        
        // Add data points
        chartData.forEach(d => {
            // Add points for every month
            if (d.receivedCount > 0) {
                const receivedCircle = createSVGElement('circle');
                receivedCircle.setAttribute('cx', xScale(d.date));
                receivedCircle.setAttribute('cy', yScale(d.receivedCount));
                receivedCircle.setAttribute('r', '4');
                receivedCircle.setAttribute('fill', colors.success);
                
                // Tooltip events
                receivedCircle.addEventListener('mousemove', (e) => {
                    const date = d.date.toLocaleDateString(undefined, { year: 'numeric', month: 'short' });
                    tooltip.show(`
                        <strong>${date}</strong><br>
                        Received: ${d.receivedCount} audits<br>
                        +${d.receivedPoints} points
                    `, e.clientX, e.clientY);
                });
                receivedCircle.addEventListener('mouseout', tooltip.hide);
                
                chartGroup.appendChild(receivedCircle);
            }
            
            if (d.givenCount > 0) {
                const givenCircle = createSVGElement('circle');
                givenCircle.setAttribute('cx', xScale(d.date));
                givenCircle.setAttribute('cy', yScale(d.givenCount));
                givenCircle.setAttribute('r', '4');
                givenCircle.setAttribute('fill', colors.danger);
                
                // Tooltip events
                givenCircle.addEventListener('mousemove', (e) => {
                    const date = d.date.toLocaleDateString(undefined, { year: 'numeric', month: 'short' });
                    tooltip.show(`
                        <strong>${date}</strong><br>
                        Given: ${d.givenCount} audits<br>
                        -${d.givenPoints} points
                    `, e.clientX, e.clientY);
                });
                givenCircle.addEventListener('mouseout', tooltip.hide);
                
                chartGroup.appendChild(givenCircle);
            }
        });
        
        // Add x-axis
        const xAxis = createSVGElement('line');
        xAxis.setAttribute('x1', 0);
        xAxis.setAttribute('y1', chartHeight);
        xAxis.setAttribute('x2', chartWidth);
        xAxis.setAttribute('y2', chartHeight);
        xAxis.setAttribute('stroke', colors.axis);
        xAxis.setAttribute('stroke-width', '1');
        chartGroup.appendChild(xAxis);
        
        // Add y-axis
        const yAxis = createSVGElement('line');
        yAxis.setAttribute('x1', 0);
        yAxis.setAttribute('y1', 0);
        yAxis.setAttribute('x2', 0);
        yAxis.setAttribute('y2', chartHeight);
        yAxis.setAttribute('stroke', colors.axis);
        yAxis.setAttribute('stroke-width', '1');
        chartGroup.appendChild(yAxis);
        
        // Add x-axis labels
        // Show only a selection of dates to avoid overcrowding
        const dateLabels = [];
        if (chartData.length <= 6) {
            // If few data points, show all
            dateLabels.push(...chartData);
        } else {
            // Show first, middle, and last
            dateLabels.push(chartData[0]);
            dateLabels.push(chartData[Math.floor(chartData.length / 2)]);
            dateLabels.push(chartData[chartData.length - 1]);
        }
        
        dateLabels.forEach(d => {
            const label = createSVGElement('text');
            label.setAttribute('x', xScale(d.date));
            label.setAttribute('y', chartHeight + 20);
            label.setAttribute('text-anchor', 'middle');
            label.setAttribute('font-size', '12px');
            label.setAttribute('fill', colors.text);
            
            // Format date as Month Year
            const date = d.date.toLocaleDateString(undefined, { month: 'short', year: '2-digit' });
            label.textContent = date;
            
            chartGroup.appendChild(label);
        });
        
        // Add y-axis labels
        const yLabels = [0, Math.ceil(maxCount / 2), maxCount];
        
        yLabels.forEach(value => {
            const label = createSVGElement('text');
            label.setAttribute('x', -15);
            label.setAttribute('y', yScale(value));
            label.setAttribute('text-anchor', 'end');
            label.setAttribute('dominant-baseline', 'middle');
            label.setAttribute('font-size', '12px');
            label.setAttribute('fill', colors.text);
            label.textContent = Helpers.formatXpAsFileSize(value);
            
            chartGroup.appendChild(label);
        });
        
        // Add legend
        const legendGroup = createSVGElement('g');
        legendGroup.setAttribute('transform', `translate(${chartWidth - 150}, 0)`);
        chartGroup.appendChild(legendGroup);
        
        // Received legend
        const receivedRect = createSVGElement('rect');
        receivedRect.setAttribute('x', 0);
        receivedRect.setAttribute('y', 0);
        receivedRect.setAttribute('width', 15);
        receivedRect.setAttribute('height', 15);
        receivedRect.setAttribute('fill', colors.success);
        legendGroup.appendChild(receivedRect);
        
        const receivedText = createSVGElement('text');
        receivedText.setAttribute('x', 25);
        receivedText.setAttribute('y', 12);
        receivedText.setAttribute('font-size', '12px');
        receivedText.setAttribute('fill', colors.text);
        receivedText.textContent = 'Received';
        legendGroup.appendChild(receivedText);
        
        // Given legend
        const givenRect = createSVGElement('rect');
        givenRect.setAttribute('x', 0);
        givenRect.setAttribute('y', 25);
        givenRect.setAttribute('width', 15);
        givenRect.setAttribute('height', 15);
        givenRect.setAttribute('fill', colors.danger);
        legendGroup.appendChild(givenRect);
        
        const givenText = createSVGElement('text');
        givenText.setAttribute('x', 25);
        givenText.setAttribute('y', 37);
        givenText.setAttribute('font-size', '12px');
        givenText.setAttribute('fill', colors.text);
        givenText.textContent = 'Given';
        legendGroup.appendChild(givenText);
        
        // Add y-axis label
        const yLabel = createSVGElement('text');
        yLabel.setAttribute('x', -40);
        yLabel.setAttribute('y', chartHeight / 2);
        yLabel.setAttribute('text-anchor', 'middle');
        yLabel.setAttribute('transform', `rotate(-90, -40, ${chartHeight / 2})`);
        yLabel.setAttribute('font-size', '12px');
        yLabel.setAttribute('fill', colors.text);
        yLabel.textContent = 'Audits';
        chartGroup.appendChild(yLabel);
    };
    
    // Return public API
    return {
        createXpBarChart,
        createPassFailPieChart,
        createXpTimelineChart,
        createAuditChart,
        createAuditHistoryChart
    };
})();