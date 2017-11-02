# optional prompt on initialization page for recovering old post

# get post ID from user (parse link)
# get all info from post
# if OAuth'd user isn't OP, throw error
# otherwise, set session post id to one provided
# parse using parse_sections() and parse_vars()

# TODO allow recovery of unposted events

# modify functions::post_info to return title and OP
# used for verifying OAuth & getting launch name (for window title)

########

# @precondition -> variables do not exist in header
# @param text -> text to be parsed
# @return -> undefined (not important)
# @postcondition -> session variables are set
def parse_sections(text)
  sections = {}

  # parse the full post into individual sections
  text.scan(
    %r{\[\]\(\/# MC // (.*)\)\n((?:.*\n)*?)(?=\[\]\(\/# MC //.*\))}
  ).each do |name, content|
    sections[name.downcase.to_sym] = content.strip
  end

  # parse the events section (if it exists)
  if sections.key?(:events) && sections[:events].length > 49
    events = []
    # [49..-1] strips header
    sections[:events][49..-1].scan(/\| (.*) \| (.*) \|/) do |time, message|
      events.push [true, time, message]
    end
    sections[:events] = events
  end

  # set session variables with parsed values
  sections.each do |key, value|
    session[key] = value
  end

  sections
end

# @precondition -> variables exist in header
# @param text -> the full text to be parsed, including unimportant sections
# @return -> [{variables}, initial text with variables stripped]
# @postcondition -> session variables are set
def parse_vars(text)
  # isolate the variables string
  raw_vars, sections = text.split('[](/# MC // END VARS)', 2)

  # parse the variables into a hash
  vars = {}
  raw_vars.scan(%r{\[\]\(\/# MC // let (.*) = (.*)\)}) do |name, value|
    vars[name.downcase.to_sym] = value == 'null' ? nil : value
  end

  # set session variables with parsed values
  vars.each do |key, value|
    session[key] = value
  end

  [vars, sections.strip]
end
