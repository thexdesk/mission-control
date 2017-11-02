# get post ID from user (parse link)
# get all info from post
# if OAuth'd user isn't OP, throw error
# otherwise, set session post to one provided
# use parse_sections(), then set session variables for all sections

# TODO allow recovery of unposted events

def parse_sections(text)
  sections = {}

  text.scan(
    %r{\[\]\(\/# MC // (.*)\)\n((?:.*\n)*?)(?=\[\]\(\/# MC //.*\))}
  ).each do |name, content|
    sections[name.downcase.to_sym] = content.strip
  end

  if sections.key? :events
    events = []
    sections[:events][49..-1].scan(/\| (.*) \| (.*) \|/) do |time, message|
      events.push [true, time, message]
    end
    sections[:events] = events
  end

  sections
end
